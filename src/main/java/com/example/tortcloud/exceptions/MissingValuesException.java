package com.example.tortcloud.exceptions;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class MissingValuesException {

    /** проверка на пропущенные, незаполненные или заполненные неправильно поля
     */
    @ExceptionHandler({ConstraintViolationException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected ResponseEntity<ErrorMessage> handleConstraintViolationException(
            ConstraintViolationException e) {
        ErrorMessage message = new ErrorMessage(
                400,
                LocalDateTime.now(),
                e.getMessage(),
                "Некоторые поля были пропущены, незаполненны или заполненны неправильно");
        return new ResponseEntity<ErrorMessage>(message, HttpStatus.BAD_REQUEST);
    }

    /** неуказанный header
     */
    @ExceptionHandler({MissingRequestHeaderException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected ResponseEntity<ErrorMessage> handleMissingRequestHeaderException(
            MissingRequestHeaderException e) {
        ErrorMessage message = new ErrorMessage(
                400,
                LocalDateTime.now(),
                e.getMessage(),
                "Missing headers");
        return new ResponseEntity<ErrorMessage>(message, HttpStatus.BAD_REQUEST);
    }

    /**
     * проверка на @NotNull
     */
    @ExceptionHandler({NullPointerException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected ResponseEntity<ErrorMessage> handleNullPointerException(
            NullPointerException e) {
        ErrorMessage message = new ErrorMessage(
                400,
                LocalDateTime.now(),
                e.getMessage(),
                "Some fields can`t be null");
        return new ResponseEntity<ErrorMessage>(message, HttpStatus.BAD_REQUEST);
    }

    /**
     * проверка в json объекте на пустой или неправильной json object
     */
    @ExceptionHandler({HttpMessageNotReadableException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected ResponseEntity<ErrorMessage> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException e) {
        ErrorMessage message = new ErrorMessage(
                400,
                LocalDateTime.now(),
                e.getMessage(),
                "Value in object is wrong or null");
        return new ResponseEntity<ErrorMessage>(message, HttpStatus.BAD_REQUEST);
    }
}
