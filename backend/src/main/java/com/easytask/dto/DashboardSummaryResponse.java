package com.easytask.dto;

import java.util.List;

public record DashboardSummaryResponse(
        long totalTasks,
        long pendingTasks,
        long completedTasks,
        long overdueTasks,
        long todayTasks,
        long upcomingTasks,
        long highPriorityTasks,
        int completionRate,
        List<TaskResponse> todayTaskList,
        List<TaskResponse> upcomingTaskList,
        List<TaskResponse> overdueTaskList
) {
}
