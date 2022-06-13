import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import Center from "../../components/center";
import TeacherNavbar from "../../components/teacherNavbar";
import MarksBarChart from "../../components/graphs/marksBarChart";
import AttendanceBarChart from "../../components/graphs/attendanceBarChart";
import DrowsinessPieChart from "../../components/graphs/drowsinessPieChart";
import EmotionPieChart from "../../components/graphs/emotionPieChart";
import {
  apiCreateSession, apiEndSession, apiGetSessions,
  apiStudentsDataForAllSessions,
  apiGetActiveSessionDetails,
  apiAllStudentsDataForActiveSession
} from "../../services/apiService";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { getConsolidatedStudentEmotions, getConsolidatedStudentDrowsiness } from "../../services/graphDataService";
import { setActiveSessionId, setActiveSessionDetails } from "../../redux/sessionSlice";

import "./teacherDashboard.css";
import Footer from "../../components/Footer/Footer";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);
  const [sessionId, setSessionId] = useState();
  const [sessionStarted, setSessionStarted] = useState();
  const [activeSessionData, setActiveSessionData] = useState();
  const [allSessionsData, setAllSessionsData] = useState();
  const [activeSessionEmotion, setActiveSessionEmotion] = useState();
  const [allSessionEmotion, setAllSessionEmotion] = useState();
  const [activeSessionDrowsiness, setActiveSessionDrowsiness] = useState();
  const [allSessionDrowsiness, setAllSessionDrowsiness] = useState();
  const [activeStudents, setActiveStudents] = useState();

  useEffect(() => {
    apiGetSessions().then(
      (res) => {
        const sessionList = res.data;
        if (sessionList) {
          const index = sessionList.findIndex(x => x.user_id == user.id);
          if (index >= 0) {
            setSessionStarted(true);
            setSessionId(sessionList[index].id);
            dispatch(setActiveSessionId(sessionList[index].id));
            getStudentsDataForActiveSession(sessionList[index].id);
          } else {
            setSessionStarted(false);
          }
        }
      },
      (err) => {
        console.error(err)
      }
    );
  }, []);


  useEffect(() => {
    getStudentsDataForAllSessions();
    if (sessionStarted && sessionId) {
      getStudentsDataForActiveSession();
    }
    // let timer1 = setTimeout(() => {
    //   getStudentsDataForAllSessions();
    //   if (sessionStarted) {
    //     getStudentsDataForActiveSession();
    //   }
    // }, 10000);
    // return () => {
    //   clearTimeout(timer1);
    // };
  }, []);

  const handleStartSession = () => {
    apiCreateSession(user).then(
      (res) => {
        setSessionStarted(true);
        dispatch(setActiveSessionId(res.data.id));
      },
      (err) => {
        console.error(err)
      }
    );
  }

  const handleStopSession = () => {
    apiEndSession(user).then(
      (res) => {
        setSessionStarted(false);
      },
      (err) => {
        console.error(err)
      }
    );
  }

  const getStudentsDataForAllSessions = () => {
    apiStudentsDataForAllSessions(user).then(
      (res) => {
        setAllSessionsData(res.data);
        dispatch(setActiveSessionDetails(res.data));
        const consolidatedAllSessionEmotion = getConsolidatedStudentEmotions(res.data);
        const consolidatedAllSessionDrowsiness = getConsolidatedStudentDrowsiness(res.data);
        setAllSessionEmotion(consolidatedAllSessionEmotion);
        setAllSessionDrowsiness(consolidatedAllSessionDrowsiness);
      },
      (err) => {
        console.error(err)
      }
    );
  }

  const getStudentsDataForActiveSession = (id) => {
    apiGetActiveSessionDetails(user, id).then(
      (res) => {
        dispatch(setActiveSessionDetails(res.data));
        setActiveStudents(res.data.students_list);
      },
      (err) => {
        console.error(err)
      }
    );
    apiAllStudentsDataForActiveSession(user).then(
      (res) => {
        setActiveSessionData(res.data);
        const consolidatedActiveSessionEmotion = getConsolidatedStudentEmotions(res.data);
        const consolidatedActiveSessionDrowsiness = getConsolidatedStudentDrowsiness(res.data);
        setActiveSessionEmotion(consolidatedActiveSessionEmotion);
        setActiveSessionDrowsiness(consolidatedActiveSessionDrowsiness);
      },
      (err) => {
        console.error(err)
      }
    );
  }

  return (
    <>
      <TeacherNavbar title="Teacher's Dashboard" />
      <Center>
        <main className="dashboard">
          <center>
            <h3 className="hello-title">Welcome, {user.first_name}</h3>
          </center>
          <div className="td-root-graphs-container">
            <div className="td-session-button-container">
              {sessionStarted ?
                <Button variant="contained" onClick={handleStopSession}>Stop Session</Button> :
                <Button variant="contained" onClick={handleStartSession}>Start Session</Button>
              }
            </div>

            {sessionStarted && (activeSessionEmotion || activeSessionDrowsiness) &&
              <div className="td-graph-section">
                <h2>Active Session</h2>
                <div className="graphs-container">
                  {activeSessionEmotion &&
                    <div className="graph-container">
                      <EmotionPieChart key={1} emotion={activeSessionEmotion} />
                    </div>
                  }
                  {activeSessionDrowsiness &&
                    <div className="graph-container">
                      <DrowsinessPieChart key={2} drowsiness={activeSessionDrowsiness} />
                    </div>
                  }
                </div>
              </div>
            }

            <div className="td-graph-section">
              <h2>All Sessions</h2>
              <div className="graphs-container">
                <div className="graph-container">
                  {allSessionEmotion && <EmotionPieChart key={3} emotion={allSessionEmotion} />}
                </div>
                <div className="graph-container">
                  {allSessionDrowsiness && <DrowsinessPieChart key={4} drowsiness={allSessionDrowsiness} />}
                </div>
              </div>
            </div>

            <h2>Attendance</h2>
            <div className="graphs-container">
              <div className="graph-container">
                {allSessionsData && <AttendanceBarChart students={activeSessionData} />}
              </div>
            </div>
            <h2>Marks</h2>
            <div className="graphs-container">
              <div className="graph-container">
                {allSessionsData && <MarksBarChart students={allSessionsData} />}
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </Center>
    </>
  );
}