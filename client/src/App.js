import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import Snackbar from "@mui/material/Snackbar";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";

import SearchIcon from "@mui/icons-material/Search";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import GoogleIcon from "@mui/icons-material/Google";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue, red } from "@mui/material/colors";

import useStyles from "./styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import "./firebase/firebase-config";

import Product from "./components/Product";
import Footer from "./components/Footer";
import "./scrollBar.css";

// const axios = require("axios");
import axios from "axios";
// const LOCAL_REFRESH_TIME = process.env.REACT_APP_LOCAL_REFRESH_TIME;
const TOKEN_REFRESH_TIME = 600000; // 10 minutes
// const LOCAL_REFRESH_TIME = 500000;
const dataLimit = 12;

if (process.env.NODE_ENV !== "production") {
  var url = process.env.REACT_APP_API_URL;
} else {
  url = "/api";
}
console.log(process.env.NODE_ENV);

const auth = getAuth();
const provider = new GoogleAuthProvider();

const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: red[400],
    },
  },
});

function App() {
  const { classes } = useStyles();

  const { register, handleSubmit } = useForm();

  const [token, setToken] = useState(null);
  const [index, setIndex] = useState([0, dataLimit]);
  const [page, setPage] = useState(1);
  const [change, setChange] = useState(null);
  const [output, setOutput] = useState(null);
  const [fullURL, setFullURL] = useState(false);
  const [fullMinPrice, setFullMinPrice] = useState(false);
  const [allValid, setAllValid] = useState(false);
  const [minPriceError, setMinPriceError] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const [delId, setDelId] = useState(null);
  const [patchInfo, setPatchInfo] = useState(null);
  const [isAlert, setIsAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadPage, setReloadPage] = useState(false);

  const onSubmit = (data) => {
    if (Object.keys(data).length > 0) {
      setChange(data);
      setIsLoading(true);
    }
  };

  const checkKeyDown = (e) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") e.preventDefault();
  };

  const handeUrlChange = (e) => {
    const url = e.target.value;
    url ? setFullURL(true) : setFullURL(false);
    url.match(/^http(s)?:\/\/www\.jumia\.ma\/.+\.html/) || !url
      ? setUrlError(false)
      : setUrlError(true);
  };

  const handeMinPriceChange = (e) => {
    const minPrice = e.target.value;
    const dotMinPrice = minPrice.replace(",", ".");
    minPrice ? setFullMinPrice(true) : setFullMinPrice(false);
    Number(dotMinPrice) > 0 || !minPrice
      ? setMinPriceError(false)
      : setMinPriceError(true);
  };

  useEffect(() => {
    if (patchInfo) {
      // if (googleProfile) {
      patchProductMinPrice(
        patchInfo.id,
        patchInfo.minPrice,
        patchInfo.price,
        token
      );
      // .then(profile => setOutput(profile.jumiaProducts))
    }
    return setPatchInfo(null);
    // eslint-disable-next-line
  }, [patchInfo]);

  useEffect(() => {
    fullURL &&
    fullMinPrice &&
    !minPriceError &&
    !urlError &&
    !isAlert &&
    !isLoading
      ? setAllValid(true)
      : setAllValid(false);
  }, [fullURL, fullMinPrice, minPriceError, urlError, isAlert, isLoading]);

  useEffect(() => {
    if (delId) {
      pullProductWithProductId(delId, token).then((profile) =>
        setOutput(profile.jumiaProducts)
      );
    }
    return setDelId(null);
    // eslint-disable-next-line
  }, [delId]);

  useEffect(() => {
    if (change) {
      if (token) {
        getProductInfoFromApi(change.url, Number(change.minPrice), token)
          .then((productInfo) => {
            if (Number(change.minPrice) >= productInfo.price) {
              productInfo.minPrice = productInfo.price - 1;
              productInfo.isCheap = false;
              setIsAlert(
                "Your minimum price is higher than the current price!"
              );
            }
            pushProductWithGoogleId(productInfo, token).then((profile) => {
              setOutput(profile.jumiaProducts);
              setIsLoading(false);
            });
          })
          .catch((err) => {
            console.error(err);
            setIsAlert("This URL is not valid!");
          });
      } else {
        setIsAlert("You're not logged in. Please log in and try again");
      }
      return setChange(null);
    }
    // eslint-disable-next-line
  }, [change]);

  const handleClose = () => {
    setIsAlert(false);
    setIsLoading(false);
  };

  useEffect(() => {
    const refreshTokenId = setInterval(async () => {
      if (token) {
        auth.currentUser
          .getIdToken(true)
          .then((newToken) => {
            setToken(newToken);
            // console.log("refresh", newToken)
          })
          .catch((err) => console.log(err));
      }
    }, TOKEN_REFRESH_TIME);
    return () => clearInterval(refreshTokenId);
  }, [token]);

  // useEffect(() => {
  //   const refresh = setInterval(async () => {
  //     if (token) {
  //       const newToken = await auth.currentUser.getIdToken()
  //       console.log(newToken)
  //       getUserWithGoogleId(newToken)
  //         .then(profile => setOutput(profile.jumiaProducts))
  //         .catch(() => setOutput(null))
  //     } else {
  //       setOutput(null)
  //     }
  //   }, LOCAL_REFRESH_TIME);
  //   return () => clearInterval(refresh);
  //   // eslint-disable-next-line
  // }, []);

  useEffect(() => {
    if (reloadPage) {
      getUserWithGoogleId(token)
        .then((profile) => setOutput(profile.jumiaProducts))
        .catch(() => {
          setOutput(null);
        });
    }
    return setReloadPage(false);
    // eslint-disable-next-line
  }, [reloadPage]);

  const handleGoogleSignOut = () => {
    signOut(auth).catch((err) => {
      console.log("signOutError : ", err);
    });
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider).catch((err) => {
      console.log("signInError: ", err);
    });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (aUser) => {
      setIndex([0, dataLimit]);
      // console.log("onAuthStateChanged")
      if (aUser) {
        auth.currentUser.getIdToken().then((tokenId) => {
          setToken(tokenId);
          getUserWithGoogleId(tokenId)
            .then((profile) => setOutput(profile.jumiaProducts))
            .catch((err) => console.log(err));
        });
      } else {
        setOutput(null);
        setToken(null);
      }
    });
    // eslint-disable-next-line
  }, []);

  const handlePaginationChange = (event, value) => {
    const startIndex = value * dataLimit - dataLimit;
    const endIndex = startIndex + dataLimit;
    setIndex([startIndex, endIndex]);
    setPage(value);
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <AppBar>
          <Toolbar disableGutters={true} className={classes.toolBar}>
            <PriceChangeIcon fontSize="large" className={classes.menuIcon} />
            <Typography variant="button" noWrap={true}>
              {" "}
              Jumia Price Tracker{" "}
            </Typography>
            <Button
              sx={{ ml: "auto", mr: "0.5rem" }}
              color="secondary"
              disableElevation={true}
              onClick={token ? handleGoogleSignOut : handleGoogleSignIn}
              variant="contained"
              startIcon={<GoogleIcon />}
            >
              {token ? "Sign out" : "Sign in"}
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" className={classes.inputFormContainer}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => checkKeyDown(e)}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 1, md: 2 }}
              justifyContent="space-between"
            >
              <TextField
                fullWidth
                {...register("url")}
                error={urlError}
                label={urlError ? "Error" : "Product URL"}
                helperText={urlError ? "Not A Valid URL" : null}
                variant="outlined"
                placeholder="https://www.jumia.ma/product.html"
                onChange={handeUrlChange}
              />
              <TextField
                {...register("minPrice")}
                error={minPriceError}
                label={minPriceError ? "Error" : "Min Price"}
                helperText={
                  minPriceError ? "Only Positive Numbers Allowed" : null
                }
                variant="outlined"
                placeholder="00.00"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Dh</InputAdornment>
                  ),
                }}
                onChange={handeMinPriceChange}
              />
              <Button type="submit" variant="outlined" disabled={!allValid}>
                <SearchIcon />
              </Button>
            </Stack>
          </form>
        </Container>

        {isAlert && (
          <Snackbar open={true} autoHideDuration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="error">
              {isAlert}
            </Alert>
          </Snackbar>
        )}

        <Container sx={{ minHeight: "90vh" }} maxWidth="lg">
          <Pagination
            disabled={isLoading}
            page={page}
            onChange={handlePaginationChange}
            count={output ? Math.ceil(output.length / dataLimit) : 1}
            sx={{
              mb: "1rem",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          />
          <Grid container spacing={2}>
            {output &&
              [...output]
                .reverse()
                .slice(index[0], index[1])
                .map((pro) => (
                  <Product
                    token={token}
                    setOutputFromProduct={(outputFromProduct) =>
                      setOutput(outputFromProduct)
                    }
                    changePatchId={({ id, minPrice, price }) => {
                      setPatchInfo({ id, minPrice, price });
                    }}
                    changeDelId={(id) => setDelId(id)}
                    key={pro._id}
                    pro={pro}
                  />
                ))}
          </Grid>
        </Container>
        <Divider sx={{ my: "1rem" }} />
        <Footer />
      </ThemeProvider>
    </>
  );
}

const patchProductMinPrice = async (productId, minPrice, price, token) => {
  const isCheap = minPrice >= price;
  const data = await axios({
    method: "patch",
    url: `${url}/patchProductMinPrice`,
    headers: { Authorization: token },
    data: { id: productId, minPrice: minPrice, isCheap: isCheap },
  }).then((res) => res.data);
  return data;
};

const pushProductWithGoogleId = async (product, token) => {
  const data = await axios({
    method: "post",
    url: `${url}/pushProduct`,
    headers: { Authorization: token },
    data: { push: product },
  })
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const getUserWithGoogleId = async (token) => {
  const data = await axios({
    method: "get",
    headers: { Authorization: token },
    url: `${url}/getUser`,
  })
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const pullProductWithProductId = async (productId, token) => {
  const data = await axios({
    method: "delete",
    url: `${url}/pullProduct`,
    headers: { Authorization: token },
    data: { id: productId },
  })
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const getProductInfoFromApi = async (productUrl, minPrice, token) => {
  const data = await axios({
    method: "post",
    url: `${url}/getProduct`,
    headers: { Authorization: token },
    data: { url: productUrl, minPrice: minPrice },
  }).then((res) => res.data);
  return data;
};

export default App;
