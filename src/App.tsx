import { Component, createSignal, onMount, For } from "solid-js";

import styles from "./App.module.css";
import { supabase } from "./supabaseClient";

const TABLE = "books";

type BookType = {
  id: string;
  name: string;
  author: string;
};

const App: Component = () => {
  const [name, setName] = createSignal("");
  const [author, setAuthor] = createSignal("");
  const [books, setBooks] = createSignal<BookType[]>([]);

  const [editBook, setEditBook] = createSignal<BookType>({
    id: "",
    name: "",
    author: "",
  });

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.log(error);
    }
    if (data) {
      setBooks(data);
    }
  };

  const onSave = async () => {
    if (!name().length || !author().length) {
      return;
    }
    try {
      const { data } = await supabase
        .from(TABLE)
        .insert({
          name: name(),
          author: author(),
        })
        .select()
        .single();

      if (data) {
        setBooks((prev) => [data, ...prev]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setName("");
      setAuthor("");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await supabase
        .from(TABLE)
        .delete()
        .match({ id: id })
        .then(() => {
          fetchBooks();
        });
    } catch (e) {
      console.log(e);
    }
  };

  const onUpdate = async () => {
    try {
      await supabase
        .from(TABLE)
        .update({
          name: editBook().name,
          author: editBook().author,
        })
        .eq("id", editBook().id);
    } catch (e) {
      console.log(e);
    }
  };

  onMount(() => {
    fetchBooks();
  });

  return (
    <div class={styles.App}>
      <h2>독서 목록</h2>
      <hr />
      <div>
        <input
          type="text"
          placeholder="name"
          value={name()}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <input
          type="text"
          placeholder="author"
          value={author()}
          onChange={(e) => setAuthor(e.currentTarget.value)}
        />
        <button onClick={onSave}>추가</button>
      </div>
      <For each={books()}>
        {(book) => (
          <div>
            <input
              type="text"
              value={book.name}
              onChange={(e) =>
                setEditBook({ ...book, name: e.currentTarget.value })
              }
            />
            <input
              type="text"
              value={book.author}
              onChange={(e) =>
                setEditBook({ ...book, author: e.currentTarget.value })
              }
            />
            <button onClick={onUpdate}>Update</button>
            <button onClick={() => onDelete(book.id)}>Delete</button>
          </div>
        )}
      </For>
    </div>
  );
};

export default App;
