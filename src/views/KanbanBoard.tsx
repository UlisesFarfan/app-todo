import PlusIcon from "../icons/PlusIcon";
import { useEffect, useState } from "react";
import ColumnContainer from "../components/ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "../components/TaskCard";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { initialState } from "../redux/reducers/combineReducers";
import { ColumnResponse, CreateColumn } from "../interface/column";
import { CreateNote, NoteResponse } from "../interface/note";
import { DeleteColumnAsync, DeleteTaskAsync, DeleteWorkSpaceAsync, GetWorkSpaceAsync, PostColumnAsync, PostTaskAsync, UpdateColumnAsync, UpdateColumnsOrderAsync, UpdateNotesOrderAsync, UpdateTaskAsync, UpdateWorkSpaceAsync } from "../redux/async/workspaceAsync";
import { Button, Input, Modal, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import EditIcon from "../icons/EditIcon";
import TrashIcon from "../icons/TrashIcon";
import { useNavigate } from "react-router-dom";

function KanbanBoard() {

  const { currentWorkSpace } = useAppSelector((state: initialState) => state.workspace);
  const dispatch = useAppDispatch()
  const [columns, setColumns] = useState<ColumnResponse[]>([]);
  const [columnsId, setColumnsId] = useState<string[]>([])
  const [workspace_name, setWorkspace_name] = useState<string>("")
  const [editMode, setEditMode] = useState<boolean>(false)
  const [activeColumn, setActiveColumn] = useState<ColumnResponse | null>(null);
  const [activeTask, setActiveTask] = useState<NoteResponse | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const navigate = useNavigate()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  useEffect(() => {
    if (currentWorkSpace === null) return
    const columns_id = currentWorkSpace.columns.map((col) => col._id)
    setColumns(currentWorkSpace.columns)
    setWorkspace_name(currentWorkSpace.name)
    setColumnsId(columns_id)

  }, [currentWorkSpace])

  return (
    <div className="m-auto flex flex-col h-full w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      {currentWorkSpace && <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto h-[500px] min-w-[1200px] flex gap-4 flex-col">
          <div className="flex justify-between">
            {!editMode ?
              <div className="flex items-center gap-4">
                <p>
                  {workspace_name && workspace_name}
                </p>
                <Button className="dark" size="sm" onClick={() => setEditMode(true)}>
                  <EditIcon />
                </Button>
              </div>
              :
              <Input type="text" className="w-[15rem] dark"
                value={workspace_name ? workspace_name : ""}
                onChange={(e) => updateWorkSpace(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditMode(false);
                    if (workspace_name !== currentWorkSpace.name) {
                      dispatch(UpdateWorkSpaceAsync({
                        _id: currentWorkSpace._id,
                        name: workspace_name!,
                      }))
                    }
                  }
                }} />}
            <div className="gap-4 flex">
              <Button className="dark stroke-white" size="sm" onPress={onOpen}>
                <TrashIcon />
              </Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark">
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">Are you sure you want to delete the workspace?</ModalHeader>
                      <ModalFooter>
                        <Button color="primary" variant="light" onPress={onClose}>
                          Close
                        </Button>
                        <Button color="danger" onPress={() => {
                          onClose()
                          if (currentWorkSpace !== null) {
                            dispatch(DeleteWorkSpaceAsync(currentWorkSpace._id))
                              .unwrap()
                              .then((() => {
                                dispatch(GetWorkSpaceAsync())
                              }))
                            navigate("/");
                          }
                        }}>
                          Delete
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </div>
          <div className="flex gap-4">
            <SortableContext items={columns !== null ? columnsId : []}>
              {columns !== null && columns.map((col, index) => (
                <ColumnContainer
                  key={index}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={col.notes}
                />
              ))}
            </SortableContext>
            <button
              onClick={() => {
                createNewColumn();
              }}
              className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2"
            >
              <PlusIcon />
              Add Column
            </button>
          </div>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={activeColumn.notes}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                columnId={activeTask.columnId ? activeTask.columnId : ""}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
      }
    </div>
  );

  function updateWorkSpace(name: string) {
    setWorkspace_name(name)
  }

  function createTask(columnId: string) {
    const new_task: CreateNote = {
      column_id: columnId,
      task: "New Task",
    }
    dispatch(PostTaskAsync({ new_task: new_task, columns: columns! }))
  }

  function deleteTask(id: string, columnId: string) {
    dispatch(DeleteTaskAsync({ noteId: id, columnId: columnId }))
  }

  function updateTask(id: string, task: string, columnId: string, signal: AbortSignal) {
    let column = columns?.find((el) => el._id === columnId)
    let new_columns: ColumnResponse[] = []
    if (column) {
      const new_notes: NoteResponse[] = column?.notes.map(el => el._id === id ? { ...el, task: task } : el)
      column = { ...column, notes: new_notes }
      new_columns = columns?.map(el => el._id === columnId ? column! : el)
      setColumns(new_columns!)
    }
    dispatch(UpdateTaskAsync({ _id: id, task: task, columnId: columnId, signal: signal }))
  }

  function createNewColumn() {
    const new_column: CreateColumn = {
      workspace_id: currentWorkSpace!._id,
      name: "New Column"
    }
    dispatch(PostColumnAsync({ workspace_name: workspace_name, columns: columns!, new_column: new_column }))
  }

  function deleteColumn(id: string) {
    const new_column = columns?.filter(el => el._id !== id)
    if (new_column) {
      dispatch(DeleteColumnAsync({
        id: id,
        new_columns: new_column
      }))
    }
  }

  function updateColumn(id: string, name: string, signal: AbortSignal) {
    const newColumns = columns!.map((col) => {
      if (col._id !== id) return col;
      return { ...col, name };
    });
    setColumns(newColumns);
    dispatch(UpdateColumnAsync({ _id: id, name: name, signal: signal }))
  }

  function onDragStart(event: DragStartEvent) {
    console.log("onDragStart", event)
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "task") {
      setActiveTask({ ...event.active.data.current.task, columnId: event.active.data.current.columnId });
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const isActiveAColumn = active.data.current?.type === "Column";
    if (isActiveAColumn) {
      if (columns === null) return null
      const activeColumnIndex = columns.findIndex((col) => col._id === activeId);
      const overColumnIndex = columns.findIndex((col) => col._id === overId);
      const new_columns_order = arrayMove(columns, activeColumnIndex, overColumnIndex)
      setColumns(new_columns_order);
      const columns_id = new_columns_order.map((col) => col._id)
      setColumnsId(columns_id)
      dispatch(UpdateColumnsOrderAsync({
        _id: currentWorkSpace!._id,
        columns: new_columns_order.map(el => el._id)
      }))
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const isActiveATask = active.data.current?.type === "task";
    const isOverATask = over.data.current?.type === "task";
    if (!isActiveATask) return;
    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      let column_to_push = columns?.filter((el) => el._id === over.data.current?.columnId)
      let column_to_pull = columns?.filter((el) => el._id === active.data.current?.columnId)
      if (column_to_pull![0]._id !== column_to_push![0]._id) {
        let new_col: NoteResponse[] = []
        column_to_push![0].notes.forEach(el => {
          new_col.push(el)
        });
        new_col.splice(over.data.current?.sortable.index, 0, active.data.current?.task)
        let new_notes = column_to_pull![0].notes.filter((el) => el._id !== active.id)
        let new_columns = columns?.map((el) => el._id === over.data.current?.columnId ? { ...el, notes: new_col } : el._id === active.data.current?.columnId ? { ...el, notes: new_notes } : el)
        setColumns(new_columns!)
        const column_push = new_columns?.find((el) => el._id === over.data.current?.columnId)
        const column_pull = new_columns?.find((el) => el._id === active.data.current?.columnId)
        dispatch(UpdateNotesOrderAsync({
          _id: column_pull!._id, notes: column_pull!.notes.map(el => el._id)
        }))
        dispatch(UpdateNotesOrderAsync({
          _id: column_push!._id, notes: column_push!.notes.map(el => el._id)
        }))
      } else {
        const overIndex = column_to_push![0].notes!.findIndex((t) => t._id === overId);
        let new_notes = column_to_push![0].notes.filter((t) => t._id !== active.id)
        new_notes.splice(overIndex, 0, active.data.current?.task)
        let new_columns = columns?.map((el) => el._id === over.data.current?.columnId ? { ...el, notes: new_notes } : el)
        setColumns(new_columns!)
        const column_push = new_columns?.find((el) => el._id === over.data.current?.columnId)
        dispatch(UpdateNotesOrderAsync({
          _id: column_push!._id, notes: column_push!.notes.map(el => el._id)
        }))
      }
    }
    const isOverAColumn = over.data.current?.type === "Column";
    // Im dropping a Task over a column 
    if (isActiveATask && isOverAColumn) {
      let column_to_push = columns?.filter((el) => el._id === overId)
      let column_to_pull = columns?.filter((el) => el._id === active.data.current?.columnId)
      let seRepite = false
      column_to_push![0].notes.forEach((el) => el._id === active.data.current?.task._id ? seRepite = true : null)
      const column_push_copy = { ...column_to_push![0] };
      if (!seRepite) {
        column_push_copy.notes = [...column_to_push![0].notes, active.data.current?.task]
      }
      let new_notes_push = column_push_copy!.notes
      let new_notes = column_to_pull![0].notes.filter((el) => el._id !== active.id)
      let new_columns = columns?.map((el) => el._id === overId ? { ...el, notes: new_notes_push } : el._id === active.data.current?.columnId ? { ...el, notes: new_notes } : el)
      setColumns(new_columns!)
      const column_push = column_to_push?.find((el) => el._id === overId)
      const column_pull = column_to_pull?.find((el) => el._id === active.data.current?.columnId)
      dispatch(UpdateNotesOrderAsync({
        _id: column_push!._id, notes: new_notes_push!.map(el => el._id)
      }))
      dispatch(UpdateNotesOrderAsync({
        _id: column_pull!._id, notes: new_notes!.map(el => el._id)
      }))
    }
  }
}

export default KanbanBoard;
