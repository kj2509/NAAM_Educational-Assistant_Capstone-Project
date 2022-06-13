import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import FormGroup from '@mui/material/FormControl';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { login } from '../../redux/userSlice';
import { apiLoginUser } from "../../services/apiService";
import { saveUserSessionInLocalStorage, getUserSessionFromLocalStorage } from "../../services/localStorageService";
import './login.css';
import { ThemeProvider } from "@mui/material";
import theme from "../../config/Theme/Theme";
import logo from "../../images/react-logo.svg";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = getUserSessionFromLocalStorage();
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(login(user));
      navigateToDashboard(user.is_teacher);
    }
  }, [])

  const handleInputOnChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleShowPasswordClick = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordMouseDown = (event) => {
    event.preventDefault();
  };

  const handleSignIn = () => {
    const loginFormData = {
      'email': values.email,
      'password': values.password
    };
    apiLoginUser(loginFormData).then(
      (res) => {
        const userData = {
          ...res.data,
          password: values.password
        }
        saveUserSessionInLocalStorage(userData);
        dispatch(login(userData));
        navigateToDashboard(res.data.is_teacher)
      },
      (err) => {
        console.error('err', err)
      }
    );
  }

  const navigateToDashboard = (is_teacher) => {
    if (is_teacher) {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  }

  return (
    <div className="login-container">
      <FormGroup className="login-form-group">
        <div className="login-logo-container">
          <img className="login-logo" src={logo} alt="logo" />
        </div>
        <div className="login-form-control">
          <FormControl sx={{ m: 1, width: '24ch' }}>
            <InputLabel>Email</InputLabel>
            <Input id="standard-basic" variant="filled" value={values.email} onChange={handleInputOnChange('email')} />
          </FormControl>
        </div>
        <div className="login-form-control">
          <FormControl sx={{ m: 1, width: '24ch' }}>
            <InputLabel>Password</InputLabel>
            <Input
              id="standard-adornment-password"
              label="Password"
              variant="filled"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleInputOnChange('password')}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleShowPasswordClick}
                    onMouseDown={handlePasswordMouseDown}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </div>
        <div className="login-form-buttons">
          <ThemeProvider theme={theme}>
          <Button variant="contained" onClick={handleSignIn} >SignIn</Button>
          <Link href="/create-user" underline="hover">Create new account</Link>
          </ThemeProvider>
        </div>
      </FormGroup>
    </div>
  )
}