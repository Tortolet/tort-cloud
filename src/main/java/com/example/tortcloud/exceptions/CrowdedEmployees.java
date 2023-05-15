package com.example.tortcloud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class CrowdedEmployees  extends RuntimeException {
    @Override
    public Throwable fillInStackTrace() {
        return this;
    }

    public CrowdedEmployees(String message) {
        super(message);
    }

}
