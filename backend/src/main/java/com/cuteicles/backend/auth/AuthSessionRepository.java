package com.cuteicles.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface AuthSessionRepository extends JpaRepository<AuthSession, String> {

    /** Ends every active session of a user except the one named by keepId (pass "" to end all). */
    @Modifying
    @Query("update AuthSession s set s.revokedAt = :now where s.userId = :userId and s.revokedAt is null and s.id <> :keepId")
    int revokeAllForUser(@Param("userId") Long userId, @Param("keepId") String keepId, @Param("now") Instant now);

    @Modifying
    @Query("delete from AuthSession s where s.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") Instant cutoff);
}
