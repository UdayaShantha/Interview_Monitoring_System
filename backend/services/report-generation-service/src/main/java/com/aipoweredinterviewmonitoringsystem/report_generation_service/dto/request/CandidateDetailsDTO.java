package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.request;

import com.aipoweredinterviewmonitoringsystem.report_generation_service.entity.enums.PositionType;

import java.time.LocalDate;

public class CandidateDetailsDTO {
    private String username;
    private String password;

    private String name;
    private String nic;
    private String email;
    private String address;
    private String phone;
    private LocalDate birthday;
    private String positionType;

    public CandidateDetailsDTO(String username, String password, String name, String nic, String email, String address, String phone, LocalDate birthday, String positionType) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.nic = nic;
        this.email = email;
        this.address = address;
        this.phone = phone;
        this.birthday = birthday;
        this.positionType = positionType;
    }

    public CandidateDetailsDTO() {
    }

//    public CandidateDetailsDTO(Object data) {
//        this.username = username;
//        this.password = password;
//        this.name = name;
//        this.nic = nic;
//        this.nic = nic;
//        this.email = email;
//        this.address = address;
//        this.phone = phone;
//        this.birthday = birthday;
//        this.positionType = positionType;
//    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getBirthday() {
        return birthday;
    }

    public void setBirthday(LocalDate birthday) {
        this.birthday = birthday;
    }

    public String getPositionType() {
        return positionType;
    }

    public void setPositionType(String positionType) {
        this.positionType = positionType;
    }


}


