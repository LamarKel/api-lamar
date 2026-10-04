package com.lamar.api_lamar.adapters.rest;

import com.lamar.api_lamar.adapters.persistence.archivo.ArchivoEntity;
import com.lamar.api_lamar.adapters.persistence.archivo.ArchivoJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
public class UploadController {

    private final ArchivoJpaRepository repo;
    private final Path uploadDir;

    public UploadController(ArchivoJpaRepository repo, @Value("${app.upload-dir:uploads}") String dir) throws IOException {
        this.repo = repo;
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    // POST /upload  (multipart/form-data, campo "file")
    @PostMapping(value = {"/upload", "/api/upload"}, consumes = "multipart/form-data")
    public ResponseEntity<?> subir(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Archivo vacío"));

        String original = StringUtils_clean(file.getOriginalFilename());
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String guardado = UUID.randomUUID() + ext;

        Files.copy(file.getInputStream(), uploadDir.resolve(guardado), StandardCopyOption.REPLACE_EXISTING);

        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/").path(guardado).toUriString();

        ArchivoEntity e = repo.save(new ArchivoEntity(original, guardado, url, file.getContentType(), file.getSize()));
        return ResponseEntity.ok(e);
    }

    @GetMapping("/api/archivos")
    public List<ArchivoEntity> listar() { return repo.findAllByOrderByFechaSubidaDesc(); }

    private static String StringUtils_clean(String n) {
        return n == null ? "archivo" : Paths.get(n).getFileName().toString();
    }
}
