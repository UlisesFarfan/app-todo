import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";
import { ColumnResponse } from "../interface/column";
import { NoteResponse } from "../interface/note";

interface Props {
  column: ColumnResponse;
  deleteColumn: (_id: string) => void;
  updateColumn: (_id: string, name: string, signal: AbortSignal) => void;
  createTask: (column_id: string) => void;
  updateTask: (_id: string, content: string, columnsId: string, signal: AbortSignal) => void;
  deleteTask: (_id: string, columnId: string) => void;
  tasks: NoteResponse[];
}

function ColumnContainer({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  const tasks_ids = useMemo(() => {
    return tasks !== null ? tasks.map((task) => task._id) : []
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column._id,
    data: {
      type: "Column",
      column,
      containerId: column._id
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  const [controller, setController] = useState<null | AbortController>(null)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (controller) controller.abort();
    const newController = new AbortController();
    setController(newController);
    const signal = newController.signal;
    updateColumn(column._id, e.target.value, signal)
  };
if (isDragging) {
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor opacity-40 border-2 border-pink-500 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    ></div>
  );
}

return (
  <div
    ref={setNodeRef}
    style={style}
    className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
  >
    {/* Column name */}
    <div
      {...attributes}
      {...listeners}
      onClick={() => {
        setEditMode(true);
      }}
      className="bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between"
    >
      <div className="flex gap-2">
        <div
          className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full"
        >
          {tasks ? tasks.length : 0}
        </div>
        {!editMode && column.name}
        {editMode && (
          <input
            className="bg-black focus:border-rose-500 border rounded outline-none px-2"
            value={column.name}
            onChange={(e) => handleChange(e)}
            autoFocus
            onBlur={() => {
              setEditMode(false);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              setEditMode(false);
            }}
          />
        )}
      </div>
      <button
        onClick={() => {
          deleteColumn(column._id);
        }}
        className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1 py-2"
      >
        <TrashIcon />
      </button>
    </div>

    {/* Column task container */}
    <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-h_idden overflow-y-auto">
      <SortableContext items={tasks_ids}>
        {tasks && tasks.map((task) => (
          <TaskCard
            key={task._id}
            columnId={column._id}
            task={task}
            deleteTask={deleteTask}
            updateTask={updateTask}
          />
        ))}
      </SortableContext>
    </div>
    {/* Column footer */}
    <button
      className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black"
      onClick={() => {
        createTask(column._id);
      }}
    >
      <PlusIcon />
      Add task
    </button>
  </div>
);
}

export default ColumnContainer;
