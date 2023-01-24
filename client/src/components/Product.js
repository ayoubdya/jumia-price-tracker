import React, { useState, useEffect } from "react";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Rating from "@mui/material/Rating";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";

import { useForm } from "react-hook-form";

import useStyles from "./../styles";
import Simples from "./Simples";
// const axios = require("axios");
import axios from "axios";

if (process.env.NODE_ENV !== "production") {
  var url = process.env.REACT_APP_API_URL;
} else {
  url = "/api";
}

const patchSelectedSimple = async (option, productId, token) => {
  const data = await axios({
    method: "patch",
    url: `${url}/patchSelectedSample`,
    headers: { Authorization: token },
    data: { option, id: productId },
  }).then((res) => res.data);
  return data;
};

export default function Product(props) {
  const { classes } = useStyles();

  const { register, handleSubmit } = useForm();

  const [minPriceChangeError, setMinPriceChangeError] = useState(false);
  // const [patchId, setPatchId] = useState(false)
  const [isEditMinPrice, setIsEditMinPrice] = useState(false);
  const [isCheap, setIsCheap] = useState(() => {
    if (props.pro.isSimpleSelected) {
      const simpleSelected = props.pro.simples.filter(
        (simple) => simple.sku === props.pro.simpleSelected
      )[0];
      return simpleSelected.isCheap;
    } else {
      return props.pro.isCheap;
    }
  });
  const [parentFinalOption, setParentFinalOption] = useState(false);
  const [minPrice, setMinPrice] = useState(props.pro.minPrice);
  const [simpleChange, setSimpleChange] = useState(
    props.pro.simpleSelected || null
  );

  const onMinPriceSubmit = (data) => {
    const dotMinPrice = Number(data.minPrice.replace(",", "."));
    if (
      dotMinPrice > 0 &&
      ((simpleChange &&
        dotMinPrice <
          props.pro.simples.filter((simple) => simple.sku === simpleChange)[0]
            .price) ||
        (!simpleChange && dotMinPrice < props.pro.price))
    ) {
      //OMG
      props.changePatchId({
        id: props.pro._id,
        minPrice: dotMinPrice,
        price: props.pro.price,
      });
      setMinPriceChangeError(false);
      setIsEditMinPrice(false);
      setMinPrice(dotMinPrice);
      if (simpleChange) {
        const simpleSelected = props.pro.simples.filter(
          (simple) => simple.sku === simpleChange
        )[0];
        setIsCheap(dotMinPrice >= simpleSelected.price);
        // console.log("minPriceChange Simple ", simpleSelected)
      } else {
        setIsCheap(dotMinPrice >= props.pro.price);
        // console.log("minPriceChange noSimple ", dotMinPrice >= props.pro.price)
      }
    } else {
      setMinPriceChangeError(true);
    }
  };

  useEffect(() => {
    if (parentFinalOption) {
      // console.log(parentFinalOption)
      setSimpleChange(parentFinalOption);
      // .then(profile => {
      const simpleSelected = props.pro.simples.filter(
        (simple) => simple.sku === parentFinalOption
      )[0];
      // setIsCheap(minPrice >= simpleSelected.price)
      // console.log("simpleChange ", minPrice >= simpleSelected.price)
      patchSelectedSimple(parentFinalOption, props.pro._id, props.token);
      if (minPrice >= simpleSelected.price) {
        setMinPrice(simpleSelected.price - 1);
        props.changePatchId({
          id: props.pro._id,
          minPrice: simpleSelected.price - 1,
          price: props.pro.price,
        });
      }
      // setIsCheap(simpleSelected.isCheap)
      // console.log("simpleChange ", simpleSelected, minPrice >= simpleSelected.price)
      // props.setOutputFromProduct(profile.jumiaProducts)
      // })
    }
    return setParentFinalOption(false);
    // eslint-disable-next-line
  }, [parentFinalOption]);

  return (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <Card
          className={props.pro.isAvailable ? null : classes.grayCard}
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <CardMedia
            component="img"
            sx={{ pt: 0 }}
            image={props.pro.imageUrl}
            alt={props.pro.title}
          />
          <CardContent sx={{ flexGrow: 1, alignItems: "center", p: "0.25rem" }}>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
            >
              <Link href={props.pro.url} target="_blank" underline="none">
                <Typography variant="subtitle1" component="h2">
                  {props.pro.title}
                </Typography>
              </Link>
              <IconButton
                value={props.pro._id}
                onClick={(e) => props.changeDelId(e.currentTarget.value)}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
            >
              {props.pro.variationSelection ? (
                <Simples
                  isEditMinPrice={isEditMinPrice}
                  setFinalOption={(option) => setParentFinalOption(option)}
                  pro={props.pro}
                />
              ) : (
                <Typography variant="subtitle2">
                  Price: {props.pro.price} Dh
                </Typography>
              )}
              {isEditMinPrice ? (
                <form onSubmit={handleSubmit(onMinPriceSubmit)}>
                  <TextField
                    {...register("minPrice")}
                    size="small"
                    variant="outlined"
                    placeholder="00.00"
                    helperText={minPriceChangeError ? "Incorrect Number" : null}
                    label={minPriceChangeError ? "Error" : "Min Price"}
                    error={minPriceChangeError}
                  ></TextField>
                </form>
              ) : (
                <Typography
                  variant="subtitle2"
                  color={isCheap ? "green" : "red"}
                >
                  Min: {minPrice} Dh
                </Typography>
              )}
              <IconButton
                disabled={!props.pro.isAvailable}
                onClick={(e) => {
                  // setPatchId(e.currentTarget.value)
                  setMinPriceChangeError(false);
                  setIsEditMinPrice(!isEditMinPrice);
                }}
                aria-label="delete"
              >
                {isEditMinPrice ? <CancelIcon /> : <EditIcon />}
              </IconButton>
            </Stack>
          </CardContent>
          <CardActions>
            <Rating
              name="read-only"
              value={props.pro.stars}
              precision={0.1}
              readOnly
            />
          </CardActions>
        </Card>
      </Grid>
    </>
  );
}
