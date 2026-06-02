package edu.unimagdalena.medsys;

import org.springframework.boot.SpringApplication;

public class TestMedsysApplication {
    public static void main(String[] args) {
        SpringApplication.from(MedsysApplication::main).with(TestcontainersConfiguration.class).run(args);
    }
}