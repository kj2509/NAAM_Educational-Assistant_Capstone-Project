import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TextField from "@mui/material/TextField";
import profileImage from "../../images/prof-image.jpg";
import StudentNavbar from "../../components/studentNavbar";
import Center from "../../components/center";
import DrowsinessPieChart from "../../components/graphs/drowsinessPieChart";
import EmotionPieChart from "../../components/graphs/emotionPieChart";
import VoicePieChart from "../../components/graphs/voicePieChart";
import { apiGetSessionStatsForStudent } from "../../services/apiService";
import { useParams } from "react-router-dom";

export default function StudentProfile() {
  const user = useSelector((state) => state.user.userData);
  const [student, setStudent] = useState();
  const { studentId } = useParams();


  useEffect(() => {
    if (user) {
      getStudentStats(user);
      getProfileImage();
    }
  }, []);

  const getStudentStats = () => {
    apiGetSessionStatsForStudent(studentId, user).then(
      (res) => {
        setStudent(res.data);
      },
      (err) => {
        console.error(err);
      }
    )
  }

  const getProfileImage = () => {

  }

  return (
    <>
      <StudentNavbar title="Profile" />
      <Center>
        {student &&
          <div className="profile-content-wrapper">
            <div className="profile-image-wrapper">
              <img
                className="profile-image"
                src={profileImage}
                alt="profile-image"
              ></img>
            </div>
            <div className="profile-details-wrapper">
              <p className="profile-id">#{student?.id}</p>
              <h1 className="profile-name">
                <span style={{ fontWeight: "normal" }}>{student?.first_name}</span> {student?.last_name}
              </h1>
              <h2 className="profile-subheading">
                <span>Attendance: </span>
                <span style={{ fontWeight: "bold" }}>{student?.stats.attendance} %</span>

              </h2>
              <div className="academic-profile-section">
                <h2 className="profile-subheading">Academic Details</h2>
                <TextField
                  className="mark-input"
                  variant="outlined"
                  value={student?.marks.assignment1}
                  label="Assignment 1"
                  disabled={!student?.is_teacher}
                />
                <TextField
                  className="mark-input"
                  variant="outlined"
                  value={student?.marks.assignment2}
                  label="Assignment 2"
                  disabled={!student?.is_teacher}
                />
                <TextField
                  className="mark-input"
                  variant="outlined"
                  value={student?.marks.test1}
                  label="Test 1"
                  disabled={!student?.is_teacher}
                />
                <TextField
                  className="mark-input"
                  variant="outlined"
                  value={student?.marks.test2}
                  label="Test 2"
                  disabled={!student?.is_teacher}
                />
                <TextField
                  className="mark-input"
                  variant="outlined"
                  value={student?.marks.midterm}
                  label="Mid-Term"
                  disabled={!student?.is_teacher}
                />
                <TextField
                  className="mark-input"
                  variant="outlined"
                  value={student?.marks.final}
                  label="Final"
                  disabled={!student?.is_teacher}
                />
                <TextField
                  className="mark-input"
                  variant="outlined"
                  value={student?.marks.total}
                  label="Total"
                  disabled
                />
                <TextField
                  className="mark-input"
                  variant="outlined"
                  value={student?.marks.predicted_total}
                  label="Predicted"
                  disabled
                />
              </div>
              <div className="academic-profile-section">
                <h2 className="profile-subheading">Character Profile</h2>
                <div className="profile-graphs-section">
                  <EmotionPieChart emotion={student?.stats.emotions} />
                  <DrowsinessPieChart drowsiness={student?.stats.drowsiness} />
                </div>
              </div>
              {/* <div className="academic-profile-section">
                <h2 className="profile-subheading">Activity Profile</h2>
                <div className="profile-graphs-section">
                  <VoicePieChart />
                </div>
              </div> */}
            </div>
          </div>
        }
      </Center>
    </>
  );
}
