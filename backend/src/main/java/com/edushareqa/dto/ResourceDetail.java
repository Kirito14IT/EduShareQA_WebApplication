package com.edushareqa.dto;

import lombok.Data;

@Data
public class ResourceDetail {
    private Long id;
    private String title;
    private String summary;
    private Long courseId;
    private Long uploaderId;
    private String uploaderName;
    private Integer downloadCount;
    private String fileType;
    private Long fileSize;
    private String visibility;
    private String createdAt;
    private String fileUrl;
    private String fileName;
}

