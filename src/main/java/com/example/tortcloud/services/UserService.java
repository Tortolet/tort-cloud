package com.example.tortcloud.services;

import com.example.tortcloud.exceptions.UserNotFound;
import com.example.tortcloud.models.Folders;
import com.example.tortcloud.models.Roles;
import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FoldersRepo;
import com.example.tortcloud.repos.UsersRepo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    public static final String UPLOAD_DIR = System.getProperty("user.dir") + "/upload";

    private final UsersRepo userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final FoldersRepo foldersRepo;

    public UserService(UsersRepo userRepo, BCryptPasswordEncoder passwordEncoder,
                       FoldersRepo foldersRepo) {
        this.userRepository = userRepo;
        this.bCryptPasswordEncoder = passwordEncoder;
        this.foldersRepo = foldersRepo;
    }

    public Users findUserById(Long userId) {
        Optional<Users> userFromDb = userRepository.findById(userId);
        return userFromDb.orElse(new Users());
    }

    public List<Users> allUsers() {
        return userRepository.findAll();
    }

    public void save(Users user){
        String enPas = bCryptPasswordEncoder.encode(user.getPassword());
        user.setPassword(enPas);
        this.userRepository.save(user);

        Folders rootDir = new Folders();
        rootDir.setRoot(true);
        rootDir.setUsers(user);
        rootDir.setUuid(UUID.randomUUID().toString());
        rootDir.setDateCreated(LocalDateTime.now());
        rootDir.setDateModified(LocalDateTime.now());
        rootDir.setName(user.getUsername());
        rootDir.setInTrash(false);

        Path path = Paths.get(UPLOAD_DIR, rootDir.getName());
        new File(path.toString()).mkdir();
        rootDir.setPath(path.toString());

        foldersRepo.save(rootDir);
    }

    public boolean registrationUser(Users user){
        Users userInBD = userRepository.findByUsername(user.getUsername());
        Users userInBDEmail = userRepository.findByEmail(user.getEmail());

        if(userInBD != null || userInBDEmail != null){
            return false;
        }

        user.setActive(true);
        user.setRoles(Collections.singleton(Roles.ROLE_USER));
        user.setAvatar("default_avatar.png");
        user.setStorage(15000000000L);

        return true;
    }

    public Users getUserFromAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Users user = userRepository.findByUsername(auth.getName());
        if(user == null){
            throw new UserNotFound("Пользователь не найден");
        }
        return user;
    }
}
