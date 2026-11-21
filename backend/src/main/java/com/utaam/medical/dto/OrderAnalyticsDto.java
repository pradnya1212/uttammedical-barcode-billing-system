package com.utaam.medical.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class OrderAnalyticsDto {

    private long totalOrders;
    private long newOrders;
    private long pendingReview;
    private long acceptedOrders;
    private long processingOrders;
    private long readyForDispatch;
    private long outForDelivery;
    private long deliveredOrders;
    private long cancelledOrders;
    private long rejectedOrders;
    private long returnRequests;

    private long todayOrderCount;
    private BigDecimal todayOrderValue = BigDecimal.ZERO;
    private BigDecimal averageOrderValue = BigDecimal.ZERO;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private BigDecimal pendingPaymentAmount = BigDecimal.ZERO;

    private double cancellationRate;
    private double deliverySuccessRate;
    private long delayedOrdersCount; // older than 24h still in pending/processing

    private List<DailyTrendDto> dailyTrends;
    private List<TopMedicineDto> topSellingMedicines;

    public OrderAnalyticsDto() {}

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getNewOrders() { return newOrders; }
    public void setNewOrders(long newOrders) { this.newOrders = newOrders; }

    public long getPendingReview() { return pendingReview; }
    public void setPendingReview(long pendingReview) { this.pendingReview = pendingReview; }

    public long getAcceptedOrders() { return acceptedOrders; }
    public void setAcceptedOrders(long acceptedOrders) { this.acceptedOrders = acceptedOrders; }

    public long getProcessingOrders() { return processingOrders; }
    public void setProcessingOrders(long processingOrders) { this.processingOrders = processingOrders; }

    public long getReadyForDispatch() { return readyForDispatch; }
    public void setReadyForDispatch(long readyForDispatch) { this.readyForDispatch = readyForDispatch; }

    public long getOutForDelivery() { return outForDelivery; }
    public void setOutForDelivery(long outForDelivery) { this.outForDelivery = outForDelivery; }

    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }

    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public long getRejectedOrders() { return rejectedOrders; }
    public void setRejectedOrders(long rejectedOrders) { this.rejectedOrders = rejectedOrders; }

    public long getReturnRequests() { return returnRequests; }
    public void setReturnRequests(long returnRequests) { this.returnRequests = returnRequests; }

    public long getTodayOrderCount() { return todayOrderCount; }
    public void setTodayOrderCount(long todayOrderCount) { this.todayOrderCount = todayOrderCount; }

    public BigDecimal getTodayOrderValue() { return todayOrderValue; }
    public void setTodayOrderValue(BigDecimal todayOrderValue) { this.todayOrderValue = todayOrderValue; }

    public BigDecimal getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(BigDecimal averageOrderValue) { this.averageOrderValue = averageOrderValue; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getPendingPaymentAmount() { return pendingPaymentAmount; }
    public void setPendingPaymentAmount(BigDecimal pendingPaymentAmount) { this.pendingPaymentAmount = pendingPaymentAmount; }

    public double getCancellationRate() { return cancellationRate; }
    public void setCancellationRate(double cancellationRate) { this.cancellationRate = cancellationRate; }

    public double getDeliverySuccessRate() { return deliverySuccessRate; }
    public void setDeliverySuccessRate(double deliverySuccessRate) { this.deliverySuccessRate = deliverySuccessRate; }

    public long getDelayedOrdersCount() { return delayedOrdersCount; }
    public void setDelayedOrdersCount(long delayedOrdersCount) { this.delayedOrdersCount = delayedOrdersCount; }

    public List<DailyTrendDto> getDailyTrends() { return dailyTrends; }
    public void setDailyTrends(List<DailyTrendDto> dailyTrends) { this.dailyTrends = dailyTrends; }

    public List<TopMedicineDto> getTopSellingMedicines() { return topSellingMedicines; }
    public void setTopSellingMedicines(List<TopMedicineDto> topSellingMedicines) { this.topSellingMedicines = topSellingMedicines; }

    public static class DailyTrendDto {
        private String date;
        private long orders;
        private BigDecimal revenue;

        public DailyTrendDto() {}
        public DailyTrendDto(String date, long orders, BigDecimal revenue) {
            this.date = date;
            this.orders = orders;
            this.revenue = revenue;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getOrders() { return orders; }
        public void setOrders(long orders) { this.orders = orders; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }

    public static class TopMedicineDto {
        private String medicineName;
        private long unitsSold;
        private BigDecimal revenue;

        public TopMedicineDto() {}
        public TopMedicineDto(String medicineName, long unitsSold, BigDecimal revenue) {
            this.medicineName = medicineName;
            this.unitsSold = unitsSold;
            this.revenue = revenue;
        }

        public String getMedicineName() { return medicineName; }
        public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
        public long getUnitsSold() { return unitsSold; }
        public void setUnitsSold(long unitsSold) { this.unitsSold = unitsSold; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }
}
