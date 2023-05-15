package com.example.tortcloud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class InvalidCompany extends RuntimeException {
    @Override
    public Throwable fillInStackTrace() {
        return this;
    }

    public InvalidCompany(String message){
        super(message);
    }
}
