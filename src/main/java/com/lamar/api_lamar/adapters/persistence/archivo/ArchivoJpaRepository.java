package com.lamar.api_lamar.adapters.persistence.archivo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ArchivoJpaRepository extends JpaRepository<ArchivoEntity, Long> {
    List<ArchivoEntity> findAllByOrderByFechaSubidaDesc();
}
