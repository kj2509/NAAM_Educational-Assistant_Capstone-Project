import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Fab from "@mui/material/Fab";
import PrintIcon from "@mui/icons-material/Print";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';
import { apiUpdateStudentMarks } from "../services/apiService";
import Button from '@mui/material/Button';

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
  },
  {
    field: "studentName",
    headerName: "Student",
    width: 110,
  },
  {
    field: "attendance",
    headerName: "Attendance",
    type: "number",
    width: 90,
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
    field: "mid_term",
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
  const allStudentsData = useSelector((state) => state.students.values);
  const [rows, setRows] = useState([]);
  const [disable, setDisable] = useState(true);
  const [save, setSave] = useState(false);
  const [atRiskStudentEmails, setAtRiskStudentEmails] = useState([]);
  const navigate = useNavigate();
  let selectionModel = [];

  useEffect(() => {
    setTableData();
  }, [])

  const setTableData = () => {
    const studentRows = [];
    const atRiskStudents = [];
    console.log('allStudentsData', allStudentsData)
    if (allStudentsData) {
      allStudentsData.forEach(student => {
        let studentMarkDataObj = {
          id: student.id,
          attendance: student.stats.attendance || undefined,
          studentName: getFullName(student.first_name, student.last_name),
          assignment1: null,
          assignment2: null,
          test1: null,
          test2: null,
          mid_term: null,
          final: null,
          total: null,
          predicted_total: null
        }
        Object.keys(student.marks).forEach(x => {
          checkAndSetMark(studentMarkDataObj, x, student.marks[x]);
          if(x == 'predicted_total' && student.marks[x]) {
            if(student.marks[x] < 60  || student.stats.attendance < 70) {
              atRiskStudents.push(student.email);
            }
          } else if(x == 'predicted_total' && student.stats.attendance) {
            if(student.stats.attendance < 70) {
              atRiskStudents.push(student.email);
            }
          }
        });
        studentRows.push(studentMarkDataObj);
      });
      setAtRiskStudentEmails(atRiskStudents);
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
          mid_term: updatedMarks.mid_term,
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

  const sendWarningEmail = () => {
    const studentEmails = atRiskStudentEmails;
    console.log('atRiskStudentEmails', atRiskStudentEmails)
    const bccList = 'mailto:?bcc='+ studentEmails.toString();
    const emailSubject = '&subject=At risk of failing the subject';
    const emailBody = '&body=Dear student%2C%0D%0A%0D%0AYou are at risk of failing the subject due to low marks or attendance.%0D%0AKindly get in touch with your coordinator.%0D%0A%0D%0AThanks and regards%2C%0D%0A%0D%0A'+ user.first_name;
    const construct = bccList.concat(emailSubject, emailBody);
    window.open(construct);
  }

  return (
    <>
      <div className="datatable-wrapper" style={{ height: "84vh", width: "100%" }}>
      <Button onClick={sendWarningEmail}>Send warning email to students</Button>
        <DataGrid
          rows={rows}
          columns={columns}
          onCellEditCommit={handleCellEditCommit}
          onCellClick={handleCellCtrlClick}
          disableSelectionOnClick
          onSelectionModelChange={handleSelectionModelChange}
          components={{ Toolbar: GridToolbar }}
        />
        <div>
        <span>Ctrl + click to view student details</span>
        </div>
      </div>
    </>
  );
}
