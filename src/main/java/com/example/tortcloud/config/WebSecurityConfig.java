package com.example.tortcloud.config;

import com.example.tortcloud.services.UserAuthService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private final UserAuthService userAuthService;

    public WebSecurityConfig(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    @Bean
    BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
//        requestCache.setMatchingRequestParameterName(null);
        http
                .cors().disable()
                .csrf().disable();

//        http
//                .requestCache((cache) -> cache
//                        .requestCache(requestCache));

        http
                .authorizeHttpRequests((authz) -> {
                            try {
                                authz
                                        .shouldFilterAllDispatcherTypes(false)
                                        .requestMatchers(HttpMethod.POST, "/api/registration").permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/get_folders_uuid_shared/**", "/api/get_bytes_folder/**", "/api/download", "/api/get_folder_uuid/**", "/api/get_files_shared/**", "/api/get_bytes_file/**", "/api/view").permitAll()
                                        .requestMatchers("/api/**").authenticated()
                                        .requestMatchers(HttpMethod.GET, "/css/**", "/js/**", "/img/**" ,"/signup" ,"/", "/shared-folders/**", "/404").permitAll()
                                        .anyRequest().authenticated()
                                        .and()
                                        .formLogin()
                                        .loginPage("/login")
                                        .defaultSuccessUrl("/")
                                        .permitAll()
                                        .and()
                                        .rememberMe()
                                        .and()
                                        .logout()
                                        .permitAll()
                                        .deleteCookies("JSESSIONID");
                            } catch (Exception e) {
                                throw new RuntimeException(e);
                            }
                        }
                )
                .httpBasic();
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity auth) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = auth.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
                .userDetailsService(userAuthService)
                .passwordEncoder(bCryptPasswordEncoder());
        return authenticationManagerBuilder.build();
    }
}
