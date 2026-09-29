type Todo = { title: string; done: boolean };

const todos: Todo[] = [];

export function add(title: string): void {
  todos.push({ title, done: false });
}

export function complete(title: string): void {
  const todo = todos.find((item) => item.title === title);
  if (todo) todo.done = true;
}

export function remaining(): Todo[] {
  return todos.filter((item) => !item.done);
}
