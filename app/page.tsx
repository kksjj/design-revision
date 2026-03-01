"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadRevisions();
    });
  }, []);

  async function loadRevisions() {
    const { data } = await supabase.from("revisions").select("*");
    setRevisions(data || []);
  }

  async function login() {
    const email = prompt("이메일 입력");
    const password = prompt("비밀번호 입력");

    await supabase.auth.signInWithPassword({ email, password });
    location.reload();
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  async function addRevision() {
    await supabase.from("revisions").insert({
      title,
      description,
    });
    setTitle("");
    setDescription("");
    loadRevisions();
  }

  async function markComplete(id: number) {
    await supabase
      .from("revisions")
      .update({ completed: true, completed_at: new Date() })
      .eq("id", id);
    loadRevisions();
  }

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>설계개정 관리 시스템</h2>
        <button onClick={login}>로그인</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>설계개정 관리</h2>
      <button onClick={logout}>로그아웃</button>

      <hr />

      <h3>설계 등록</h3>
      <input
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder="내용"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <button onClick={addRevision}>등록</button>

      <hr />

      <h3>목록</h3>
      {revisions.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <b>{r.title}</b>
          <p>{r.description}</p>
          <p>완료: {r.completed ? "O" : "X"}</p>
          {!r.completed && (
            <button onClick={() => markComplete(r.id)}>완료처리</button>
          )}
        </div>
      ))}
    </div>
  );
}
