package com.example.tortcloud.services;

import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.UsersRepo;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
public class UserAuthService implements UserDetailsService {
    private final UsersRepo userRepo;

    public UserAuthService(UsersRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users inDB = userRepo.findByUsername(username);

        if(inDB == null || !inDB.isActive()){
            throw new UsernameNotFoundException("User not found");
        }

        return new UserDetails() {

            @Override
            public Collection<? extends GrantedAuthority> getAuthorities() {
                return inDB.getRoles();
            }

            @Override
            public String getPassword() {
                return inDB.getPassword();
            }

            @Override
            public String getUsername() {
                return inDB.getUsername();
            }

            @Override
            public boolean isAccountNonExpired() {
                return true;
            }

            @Override
            public boolean isAccountNonLocked() {
                return true;
            }

            @Override
            public boolean isCredentialsNonExpired() {
                return true;
            }

            @Override
            public boolean isEnabled() {
                return inDB.isActive();
            }
        };
    }
}
