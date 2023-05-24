package com.example.tortcloud.services;

import com.example.tortcloud.schemas.MessageSchema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class DefaultEmailService {

    @Autowired
    public JavaMailSender emailSender;

    public void sendSimpleEmail(MessageSchema messageSchema) {

        SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
        simpleMailMessage.setFrom("youngtort@yandex.ru");
        simpleMailMessage.setTo(messageSchema.toAddress());
        simpleMailMessage.setSubject(messageSchema.subject());
        simpleMailMessage.setText(messageSchema.message());
        emailSender.send(simpleMailMessage);

        System.out.println("Mail Sent!");
    }
}