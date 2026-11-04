package com.cuteicles.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /** Single-use enforcement: only one request can flip used_at from NULL. Returns 1 for the winner, 0 otherwise. */
    @Modifying
    @Query("update PasswordResetToken t set t.usedAt = :now where t.id = :id and t.usedAt is null and t.expiresAt > :now")
    int consume(@Param("id") Long id, @Param("now") Instant now);

    /** The newest code for this user that is neither used nor expired. */
    @Query("select t from PasswordResetToken t where t.userId = :userId and t.usedAt is null and t.expiresAt > :now order by t.id desc")
    java.util.List<PasswordResetToken> findActive(@Param("userId") Long userId, @Param("now") Instant now);

    /** Newest code request time for this user (used for the resend cooldown). */
    @Query("select max(t.createdAt) from PasswordResetToken t where t.userId = :userId")
    Instant latestCreatedAt(@Param("userId") Long userId);

    /**
     * Counts one guess atomically. Returns 1 if the guess is allowed (fewer than max so far), 0 if the code is
     * already used up. Because the check and the increment are one statement, parallel guesses cannot exceed max.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update PasswordResetToken t set t.attempts = t.attempts + 1 where t.id = :id and t.usedAt is null and t.attempts < :max")
    int countAttempt(@Param("id") Long id, @Param("max") int max);

    @Modifying
    @Query("update PasswordResetToken t set t.usedAt = :now where t.userId = :userId and t.usedAt is null")
    int invalidateAllForUser(@Param("userId") Long userId, @Param("now") Instant now);
}
