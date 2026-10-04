package com.lamar.api_lamar.adapters.persistence.archivo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "archivos")
public class ArchivoEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombreOriginal;
    private String nombreGuardado;
    private String url;
    private String tipo;
    private Long tamano;
    private LocalDateTime fechaSubida = LocalDateTime.now();

    public ArchivoEntity() {}
    public ArchivoEntity(String nombreOriginal, String nombreGuardado, String url, String tipo, Long tamano) {
        this.nombreOriginal = nombreOriginal; this.nombreGuardado = nombreGuardado;
        this.url = url; this.tipo = tipo; this.tamano = tamano;
    }
    public Long getId() { return id; }
    public String getNombreOriginal() { return nombreOriginal; }
    public String getNombreGuardado() { return nombreGuardado; }
    public String getUrl() { return url; }
    public String getTipo() { return tipo; }
    public Long getTamano() { return tamano; }
    public LocalDateTime getFechaSubida() { return fechaSubida; }
}
