package com.example.tortcloud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class UserStorageIsAlreadyFull extends RuntimeException {
    @Override
    public Throwable fillInStackTrace() {
        return this;
    }

    public UserStorageIsAlreadyFull(String message){
        super(message);
    }
}
