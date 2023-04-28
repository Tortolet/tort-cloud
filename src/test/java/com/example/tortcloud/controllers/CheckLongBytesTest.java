package com.example.tortcloud.controllers;

import com.example.tortcloud.models.Users;
import com.example.tortcloud.repos.FilesRepo;
import com.example.tortcloud.repos.UsersRepo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CheckLongBytesTest {

    @Autowired
    private FilesRepo filesRepo;

    @Autowired
    private UsersRepo usersRepo;

    @Test
    public void testLongByte(){
        Long test = 0L;
        Users users = usersRepo.findByUsername("test");
        test = filesRepo.findByUsers(users);
        System.out.println(test);

//        assertNull(test = filesRepo.findByUsers(users));
    }
}
