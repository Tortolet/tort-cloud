package com.example.tortcloud.schemas;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AddUserSchema {
    @JsonProperty(required = true)
    private String username;
    @JsonProperty(required = true)
    private String password;
    @JsonProperty(required = true)
    private String passwordConfirm;
    @JsonProperty(required = true)
    private String email;
    @JsonProperty
    private String about;
}
