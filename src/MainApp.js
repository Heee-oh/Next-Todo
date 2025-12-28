import React, { useState, useEffect } from 'react';
import './App.css';
import { init, getModel } from './db';

const getFormattedDate = (date) => {
  return date.toISOString().slice(0, 10);
};

function MainApp() {
  const [dbReady, setDbReady] = useState(false);
  const [todayTodos, setTodayTodos] = useState([]);
  const [tomorrowTodos, setTomorrowTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showTomorrow, setShowTomorrow] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await init();
      setDbReady(true);
    };
    initialize();
  }, []);

  // Electron 창 크기 조절
  useEffect(() => {
    // 1. 적절한 가로 너비를 설정합니다. (줄였을 때 250, 늘렸을 때 500)
    const width = showTomorrow ? 500 : 300;
    const height = 400; // 현재 위젯 높이 유지

    // 2. Electron 메인 프로세스에 'resize-widget'이라는 이름으로 신호를 보냅니다.
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('resize-widget', width, height);
    }
  }, [showTomorrow]); // [중요] showTomorrow가 변할 때만 이 함수가 실행됩니다.


  const fetchTodos = async () => {
    const Todo = getModel();
    const today = getFormattedDate(new Date());
    const tomorrow = getFormattedDate(new Date(Date.now() + 86400000));

    const todayResult = await Todo.findAll({
      where: { date: today },
      order: [['id', 'ASC']],
    });

    const tomorrowResult = await Todo.findAll({
      where: { date: tomorrow },
      order: [['id', 'ASC']],
    });

    setTodayTodos(todayResult.map((t) => t.toJSON()));
    setTomorrowTodos(tomorrowResult.map((t) => t.toJSON()));
  };

  useEffect(() => {
    if (dbReady) fetchTodos();
  }, [dbReady]);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    const Todo = getModel();
    const tomorrow = getFormattedDate(new Date(Date.now() + 86400000));

    await Todo.create({ text: newTodo, date: tomorrow });
    setNewTodo('');
    fetchTodos();
  };

  const handleDeleteTodo = async (id) => {
    const Todo = getModel();
    await Todo.destroy({ where: { id } });
    fetchTodos();
  };

  const handleEditTodo = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const handleUpdateTodo = async (id) => {
    const Todo = getModel();
    await Todo.update({ text: editingText }, { where: { id } });
    setEditingId(null);
    setEditingText('');
    fetchTodos();
  };

  const handleToggleTodayComplete = async (todo) => {
    const Todo = getModel();
    await Todo.update(
      { completed: !todo.completed },
      { where: { id: todo.id } }
    );
    fetchTodos();
  };

  if (!dbReady) {
    return <div>Loading...</div>;
  }

  // today 창 너비 결정
  const appWidth = showTomorrow ? 500 : 300;

  return (
    <div
      className="App"
      style={{
        width: appWidth,
        height: 380,
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <header
        className="App-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18, userSelect: 'none' }}>
          NextStep Todo
        </h1>
        <button
          className="icon-btn"
          style={{
            fontSize: 18,
            padding: '2px 10px',
            WebkitAppRegion: 'no-drag',
          }}
          onClick={() => setShowTomorrow((v) => !v)}
        >
          {showTomorrow ? '〈' : '〉'}
        </button>
      </header>

      <main style={{ display: 'flex', height: '100%' }}>
        {/* TODAY */}
        <div
          className="today"
          style={{
            flex: showTomorrow ? '1 1 0' : '1 1 100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2>Today</h2>
          <ul style={{ flex: 1, overflowY: 'auto', padding: '0 15px' }}>
            {todayTodos.map((todo) => (
              <li
                key={todo.id}
                className={todo.completed ? 'completed' : ''}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodayComplete(todo)}
                />
                <span>{todo.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* TOMORROW */}
        {showTomorrow && (
          <div
            className="tomorrow"
            style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column' }}
          >
            <h2>Tomorrow</h2>
            <ul style={{ flex: 1, overflowY: 'auto', padding: '0 15px' }}>
              {tomorrowTodos.map((todo) => (
                <li key={todo.id}>
                  {editingId === todo.id ? (
                    <>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                      />
                      <button onClick={() => handleUpdateTodo(todo.id)}>
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{todo.text}</span>
                      <button
                        onClick={() => handleEditTodo(todo)}
                        className="icon-btn"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="icon-btn delete"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <div className="add-todo">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="내일 할 일을 추가해보세요"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <button onClick={handleAddTodo}>Add</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MainApp;
