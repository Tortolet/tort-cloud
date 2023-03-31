package com.example.tortcloud.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.io.Serializable;
import java.util.Set;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer"})
public class Folders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Users users;

    // 1-й вариант
    @OneToMany(mappedBy = "folders", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Set<Folders> folderParent;

    @ManyToOne
    @JoinColumn(name = "folder_parent")
    private Folders folders;

    // 2-й вариант
//    @ManyToOne(fetch = FetchType.LAZY)
//    @OnDelete(action = OnDeleteAction.CASCADE)
//    private Folders folderParent;

    public Folders() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // 1-й
    public Folders getFolders() {
        return folders;
    }

    public void setFolders(Folders folders) {
        this.folders = folders;
    }

    // 2-й
//    public Folders getFolderParent() {
//        return folderParent;
//    }
//
//    public void setFolderParent(Folders folderParent) {
//        this.folderParent = folderParent;
//    }

    public Users getUsers() {
        return users;
    }

    public void setUsers(Users users) {
        this.users = users;
    }
}
