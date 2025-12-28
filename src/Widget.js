import React, { useState, useEffect } from 'react';
import './Widget.css';
import { init, getModel, getSequelizeOp } from './db';

const { ipcRenderer } = window.require('electron');

const getFormattedDate = (date) => {
  return date.toISOString().slice(0, 10);
};


function Widget() {
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [todayTodos, setTodayTodos] = useState([]);
  const [tomorrowTodos, setTomorrowTodos] = useState([]);

  const [newTomorrowTodo, setNewTomorrowTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // showTomorrow 상태 변경을 감지하여 창 크기 조절 요청
  useEffect(() => {
    // Today 창(축소 상태): 230px / 확장 상태: 460px (1460은 너무 커서 수정했습니다)
    const width = showTomorrow ? 460 : 230;
    const height = 400; // 높이 값을 반드시 정의해야 합니다!

    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      // 이제 width와 정의된 height를 보냅니다.
      ipcRenderer.send('resize-widget', width, height);
    }
  }, [showTomorrow]);

  useEffect(() => {
    const initialize = async () => {
      await init();
      setDbReady(true);
    };
    initialize();
  }, []);


  const fetchTodos = async () => {
    const Todo = getModel();
    const today = getFormattedDate(new Date());
    const tomorrow = getFormattedDate(new Date(Date.now() + 86400000));

    const todayResult = await Todo.findAll({ where: { date: today }, order: [['id', 'ASC']] });
    const tomorrowResult = await Todo.findAll({ where: { date: tomorrow }, order: [['id', 'ASC']] });

    setTodayTodos(todayResult.map(t => t.toJSON()));
    setTomorrowTodos(tomorrowResult.map(t => t.toJSON()));
  };

  useEffect(() => {
    if (dbReady) {
      fetchTodos();
    }
  }, [dbReady]);


  const openMainApp = () => {
    ipcRenderer.send('open-main-app');
  };


  const handleToggleComplete = async (todo) => {
    const Todo = getModel();
    await Todo.update({ completed: !todo.completed }, { where: { id: todo.id } });
    await fetchTodos();
  };

  // Tomorrow todo handlers
  const handleAddTomorrowTodo = async () => {
    if (newTomorrowTodo.trim() !== "") {
      const Todo = getModel();
      const tomorrow = getFormattedDate(new Date(Date.now() + 86400000));
      await Todo.create({ text: newTomorrowTodo, date: tomorrow });
      setNewTomorrowTodo("");
      await fetchTodos();
    }
  };

  const handleDeleteTomorrowTodo = async (id) => {
    const Todo = getModel();
    await Todo.destroy({ where: { id } });
    await fetchTodos();
  };

  const handleEditTomorrowTodo = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const handleUpdateTomorrowTodo = async (id) => {
    const Todo = getModel();
    await Todo.update({ text: editingText }, { where: { id } });
    setEditingId(null);
    setEditingText("");
    await fetchTodos();
  };

  if (!dbReady) {
    return <div className="Widget">Loading...</div>;
  }

  return (
    <div className={`Widget${showTomorrow ? ' expanded' : ''}`}>
      <header className="Widget-header">
        <h2>Today's Todos</h2>
        {!showTomorrow && (
          <button
            className="arrow-btn"
            onClick={() => setShowTomorrow(true)}
            aria-label="Show Today & Tomorrow"
          >
            〉
          </button>
        )}
      </header>
      <div className="Widget-panels">
        <div className="Widget-panel today-panel">
          <ul className="Widget-list">
            {todayTodos.map((todo, index) => (
              <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                />
                <span>{todo.text}</span>
              </li>
            ))}
          </ul>
          <button onClick={openMainApp} className="open-app-button">
            Add/Edit Todos
          </button>
        </div>
        {showTomorrow && (
          <div className="Widget-panel tomorrow-panel">
            <div className="tomorrow-header">
              <h3>Tomorrow's Todos</h3>
              <button
                className="close-btn"
                onClick={() => setShowTomorrow(false)}
                aria-label="Show Only Today"
              >
                ×
              </button>
            </div>
            <ul className="Widget-list">
              {tomorrowTodos.map((todo) => (
                <li key={todo.id}>
                  {editingId === todo.id ? (
                    <>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="todo-edit-input"
                      />
                      <button onClick={() => handleUpdateTomorrowTodo(todo.id)} className="small-btn">Save</button>
                    </>
                  ) : (
                    <>
                      <span>{todo.text}</span>
                      <button onClick={() => handleEditTomorrowTodo(todo)} className="small-btn">Edit</button>
                      <button onClick={() => handleDeleteTomorrowTodo(todo.id)} className="small-btn">Delete</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="add-todo">
              <input
                type="text"
                value={newTomorrowTodo}
                onChange={(e) => setNewTomorrowTodo(e.target.value)}
                placeholder="내일 할 일을 추가해보세요"
                className="todo-edit-input"
              />
              <button onClick={handleAddTomorrowTodo} className="small-btn">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Widget;
