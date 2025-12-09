package com.edushareqa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> items;
    private Integer page;
    private Integer pageSize;
    private Long total;
    
    public static <T> PagedResponse<T> of(List<T> items, Integer page, Integer pageSize, Long total) {
        return new PagedResponse<>(items, page, pageSize, total);
    }
}

