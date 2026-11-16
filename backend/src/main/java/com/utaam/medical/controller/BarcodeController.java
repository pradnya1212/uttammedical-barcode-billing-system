package com.utaam.medical.controller;

import com.utaam.medical.dto.BarcodeLookupResponse;
import com.utaam.medical.dto.BatchBarcodeLookupResponse;
import com.utaam.medical.service.BarcodeService;
import com.utaam.medical.service.Code128Service;
import com.utaam.medical.service.MedicineBatchService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/barcode")
public class BarcodeController {
    private final BarcodeService service; private final MedicineBatchService batchService; private final Code128Service code128;
    public BarcodeController(BarcodeService service, MedicineBatchService batchService, Code128Service code128) { this.service = service; this.batchService = batchService; this.code128 = code128; }
    @GetMapping("/{barcode}") public BarcodeLookupResponse lookup(@PathVariable String barcode) { return service.lookup(barcode); }
    @GetMapping("/batch/{barcode}") public BatchBarcodeLookupResponse lookupBatch(@PathVariable String barcode) { return batchService.lookup(barcode); }
    @GetMapping(value = "/image/{value}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> image(@PathVariable String value) {
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=barcode.png").body(code128.png(value));
    }
}
