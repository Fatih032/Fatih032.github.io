package com.fatihuyanik.expection;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundExpection extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ResourceNotFoundExpection(String message) {
        super(message);
    }
}
