//package com.aipoweredinterviewmonitoringsystem.api_gateway.filter;
//
//import org.springframework.http.server.reactive.ServerHttpRequest;
//import org.springframework.stereotype.Component;
//
//import java.util.List;
//import java.util.function.Predicate;
//
//@Component
//public class RouteValidator {
//
//    public static final List<String> openApiEndpoints = List.of(
//            "api/v1/user/login"
//    );
//
//    public Predicate<ServerHttpRequest> isSecured = request -> openApiEndpoints
//            .stream()
//            .noneMatch(uri->request.getURI().getPath().contains(uri));
//}
