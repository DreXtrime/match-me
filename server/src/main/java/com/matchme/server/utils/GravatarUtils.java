package com.matchme.server.utils;

import org.springframework.util.DigestUtils;

public class GravatarUtils {
    // generate gravatar profile picture URL from email
    // https://docs.gravatar.com/sdk/images/
    public static String getGravatarUrl(String email) {
        String hash = DigestUtils.md5DigestAsHex(email.toLowerCase().trim().getBytes());
        return "https://www.gravatar.com/avatar/" + hash + "?d=mp&s=256";
    }
}
