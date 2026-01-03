package com.edushareqa.dto;

import lombok.Data;
import java.util.List;

@Data
public class TeacherDashboardStats {
    private Long pendingQuestions;
    private Long totalResources;
    private Long totalAnswers;
    private List<RecentActivity> recentActivity;

    @Data
    public static class RecentActivity {
        private String type;
        private String description;
        private String time;
    }
}
