import React from "react";

import { useDispatch, useSelector } from "react-redux";

import Card from "@mui/joy/Card";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Tooltip from "@mui/joy/Tooltip";
import Checkbox from "@mui/joy/Checkbox";
import Container from "@mui/joy/Container";

import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import IconButton from "@mui/joy/IconButton";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";

import { LemmyHttp } from "lemmy-js-client";

import { addUser, setUsers, setCurrentUser } from "../reducers/accountReducer";

export default function LoginForm() {
  const dispatch = useDispatch();

  const users = useSelector((state) => state.accountReducer.users);

  const [instanceBase, setInstanceBase] = React.useState("lemmy.tgxn.net");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);

  const [saveSession, setSaveSession] = React.useState(false);

  const [loginError, setLoginError] = React.useState("");

  // perform login against lemmy instance
  const loginClick = async () => {
    setIsLoading(true);
    try {
      const lemmyClient = new LemmyHttp(`https://${instanceBase}`);

      const auth = await lemmyClient.login({
        username_or_email: username,
        password: password,
      });

      if (auth.jwt) {
        console.log("Logged in!");

        const getSite = await lemmyClient.getSite({
          auth: auth.jwt,
        });

        console.log("getSite", getSite);

        if (saveSession) {
          dispatch(addUser(instanceBase, auth.jwt, getSite));
        } else {
          dispatch(setCurrentUser(instanceBase, auth.jwt, getSite));
        }
      } else {
        console.log(auth);
        setLoginError(auth);
      }
    } catch (e) {
      console.log(e);
      setLoginError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth={"sm"} sx={{}}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          sx={{
            mt: 4,
            p: 2,
            py: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Typography
            isLoading={isLoading}
            sx={{
              // px: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            Login
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Input
              placeholder="Instance URL"
              value={instanceBase}
              onChange={(e) => setInstanceBase(e.target.value)}
              variant="outlined"
              color="neutral"
              sx={{ mb: 1 }}
            />
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              color="neutral"
              sx={{ mb: 1 }}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              color="neutral"
              sx={{ mb: 1 }}
            />

            <Box>
              <Tooltip title="Your session will be saved locally" placement="top">
                <Checkbox
                  label="Save Session"
                  variant="outlined"
                  checked={saveSession}
                  onChange={() => setSaveSession(!saveSession)}
                />
              </Tooltip>
            </Box>

            <Button fullWidth onClick={loginClick} disabled={username.length === 0 || password.length === 0}>
              Login
            </Button>
          </Box>

          {loginError && (
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                fontSize: "0.8rem",
                color: "#ff0000",

                // display: "flex",
                // justifyContent: "center",
                // // pt: 2,
              }}
            >
              {loginError}
            </Typography>
          )}
        </Card>

        {users && users.length > 0 && (
          <Card
            sx={{
              mt: 4,
              p: 2,
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Typography
              isLoading={isLoading}
              sx={{
                // px: 2,
                display: "flex",
                justifyContent: "center",
              }}
            >
              Saved Sessions
            </Typography>
            <List sx={{ width: "100%" }}>
              {users.map((user, index) => (
                <ListItem
                  disabled={isLoading}
                  endAction={
                    <IconButton
                      aria-label="Delete"
                      size="sm"
                      color="danger"
                      onClick={() => {
                        // remove the current index
                        const newUsers = users.filter((_, i) => i !== index);

                        dispatch(setUsers(newUsers));
                      }}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => {
                      dispatch(setCurrentUser(user.base, user.jwt, user.site));
                    }}
                  >
                    {user.site.my_user?.local_user_view?.person.name}@{user.base}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        )}
      </Box>
    </Container>
  );
}
