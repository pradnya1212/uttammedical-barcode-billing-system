package com.utaam.medical.dto;

public class DeliveryStaffDto {

    private String id;
    private String name;
    private String phone;
    private String status; // AVAILABLE, BUSY, ON_LEAVE
    private int activeDeliveries;
    private int completedToday;
    private String averageDeliveryTime;
    private double successRate;

    public DeliveryStaffDto() {}

    public DeliveryStaffDto(String id, String name, String phone, String status, int activeDeliveries, int completedToday, String averageDeliveryTime, double successRate) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.status = status;
        this.activeDeliveries = activeDeliveries;
        this.completedToday = completedToday;
        this.averageDeliveryTime = averageDeliveryTime;
        this.successRate = successRate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getActiveDeliveries() { return activeDeliveries; }
    public void setActiveDeliveries(int activeDeliveries) { this.activeDeliveries = activeDeliveries; }
    public int getCompletedToday() { return completedToday; }
    public void setCompletedToday(int completedToday) { this.completedToday = completedToday; }
    public String getAverageDeliveryTime() { return averageDeliveryTime; }
    public void setAverageDeliveryTime(String averageDeliveryTime) { this.averageDeliveryTime = averageDeliveryTime; }
    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double successRate) { this.successRate = successRate; }
}
