package com.cuteicles.backend.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "about_paragraphs")
public class AboutParagraph {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false, length = 2000)
    private String body;

    protected AboutParagraph() {}

    public AboutParagraph(int position, String body) {
        this.position = position;
        this.body = body;
    }

    public Long getId() { return id; }
    public int getPosition() { return position; }
    public String getBody() { return body; }
}
