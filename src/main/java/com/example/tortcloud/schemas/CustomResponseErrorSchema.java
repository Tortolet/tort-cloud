package com.example.tortcloud.schemas;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class CustomResponseErrorSchema {

    @JsonProperty
    private LocalDateTime timestamp;
    @JsonProperty
    private int status;
    @JsonProperty
    private String error;
    @JsonProperty
    private String trace;
    @JsonProperty
    private String message;
    @JsonProperty
    private String path;
}
