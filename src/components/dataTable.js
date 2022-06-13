import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Fab from "@mui/material/Fab";
import PrintIcon from "@mui/icons-material/Print";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import { apiUpdateStudentMarks } from "../services/apiService";

const assignment1Max = 10;
const test1Max = 15;
const midtermMax = 20;
const assignment2Max = 10;
const test2Max = 15;
const finalMax = 30;
const totalMax = 100;

const columns = [
  {
    field: "id",
    headerName: "ID",
    width: 30,
    editable: false
  },
  {
    field: "studentName",
    headerName: "Student",
    width: 110,
    editable: true,
  },
  {
    field: "attendance",
    headerName: "Attendance",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "assignment1",
    headerName: "Assignment 1 (" + assignment1Max + ")",
    type: "number",
    width: 140,
    editable: true,
  },
  {
    field: "test1",
    headerName: "Test 1 (" + test1Max + ")",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "midterm",
    headerName: "Midterm (" + midtermMax + ")",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "assignment2",
    headerName: "Assignment 2 (" + assignment2Max + ")",
    type: "number",
    width: 140,
    editable: true,
  },
  {
    field: "test2",
    headerName: "Test 2 (" + test2Max + ")",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "final",
    headerName: "Final (" + finalMax + ")",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "total",
    headerName: "Scored",
    type: "number",
    width: 90
  },
  {
    field: "predicted_total",
    headerName: "Predicted (" + totalMax + ")",
    type: "number",
    width: 110
  }
];

export default function DataTable() {
  const user = useSelector((state) => state.user.userData);
  const activeSessionData = useSelector((state) => state.session.sessionDetails);
  const [rows, setRows] = useState([]);
  const [disable, setDisable] = useState(true);
  const [save, setSave] = useState(false);
  const navigate = useNavigate();
  let selectionModel = [];

  useEffect(() => {
    setTableData();
  }, [])

  const setTableData = () => {
    const studentsInActiveSession = activeSessionData?.students_list;
    const studentRows = [];
    if (studentsInActiveSession) {
      studentsInActiveSession.forEach(student => {
        let studentMarkDataObj = {
          id: student.id,
          studentName: getFullName(student.first_name, student.last_name),
          assignment1: null,
          assignment2: null,
          test1: null,
          test2: null,
          midterm: null,
          final: null,
          total: null,
          predicted_total: null
        }
        Object.keys(student.marks).forEach(x => {
          checkAndSetMark(studentMarkDataObj, x, student.marks[x]);
        });
        studentRows.push(studentMarkDataObj);
      });
      setRows(studentRows);
    }
  }

  const checkAndSetMark = (markObj, key, val) => {
    if (val != null && val >= 0 && val) {
      markObj[key] = val;
    }
  }

  const getFullName = (firstName, lastName) => {
    return firstName + " " + lastName;
  }

  const handleCellEditCommit = (params) => {
    const fieldName = params.field;
    const updatedValue = params.value;
    let updatedRow = params.row;
    updatedRow[fieldName] = updatedValue;
    apiUpdateStudentMarks(user, params.id, updatedRow).then(
      (res) => {
        let updatedMarks = res.student.marks;
        let responseDataObj = {
          id: params.id,
          studentName: getFullName(res.student.first_name, res.student.last_name),
          assignment1: updatedMarks.assignment1,
          assignment2: updatedMarks.assignment2,
          test1: updatedMarks.test1,
          test2: updatedMarks.test2,
          midterm: updatedMarks.midterm,
          final: updatedMarks.final,
          total: updatedMarks.total,
          predicted_total: updatedMarks.predicted_total
        }
        let updatedRow = rows.filter(x => x.id != params.id);
        updatedRow.push(responseDataObj);
        setRows(updatedRow);
      },
      (err) => {
        console.error(err);
      }
    );
  };

  const handleCellCtrlClick = (params, e) => {
    if (params.row.id && e.ctrlKey) {
      navigate(`/student/${params.row.id}`);
    }
  };

  const handleSelectionModelChange = (params) => {
    selectionModel = params;
    if (selectionModel.length == 0) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  };

  return (
    <>
      <div className="datatable-wrapper" style={{ height: "84vh", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          onCellEditCommit={handleCellEditCommit}
          onCellClick={handleCellCtrlClick}
          disableSelectionOnClick
          onSelectionModelChange={handleSelectionModelChange}
          components={{ Toolbar: GridToolbar }}
        />
        <span>Ctrl + click to view student details</span>
      </div>
    </>
  );
}
