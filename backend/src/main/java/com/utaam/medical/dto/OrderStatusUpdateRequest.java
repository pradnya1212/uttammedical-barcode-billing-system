
package com.utaam.medical.dto;

public class OrderStatusUpdateRequest {

    private String status;
    private String note;

    public OrderStatusUpdateRequest() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
