import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { texts } from "../texts";
import { Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Menu from "@mui/material/Menu";
import { IconButton } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";

const menuLeftData = {
  any: [{ name: texts.menuTexts.about, url: "/about" }],
  user: [],
  noUser: [],
};

const menuRightData = {
  any: [],
  user: [],
  noUser: [],
};

const menuSettingsData = {
  any: [],
  user: [],
  noUser: [],
};

const allMenuData = {
  left: menuLeftData,
  right: menuRightData,
  settings: menuSettingsData,
};

export const getDisplayed = (vals, isLoggedIn) => {
  const valsAny = vals.any;
  const valsUser = vals.user;
  const valsNoUser = vals.noUser;
  return valsAny.concat(isLoggedIn ? valsUser : valsNoUser);
};

const getMenusDisplayed = (isLoggedIn) => {
  // Apply getDisplayed to each value in allMenuData
  const menusDisplayed = {};
  for (const key in allMenuData) {
    menusDisplayed[key] = getDisplayed(allMenuData[key], isLoggedIn);
  }
  return menusDisplayed;
};

export function TopMenu() {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const hasUserToken = useSelector(hasUserTokenSelector);
  const theme = useTheme();

  const menusDisplayed = getMenusDisplayed(hasUserToken);

  const getPagesItem = (pageData) => {
    const { name, url } = pageData;
    var item = (
      <MenuItem key={name} component={RouterLink} to={url}>
        <Typography
          textAlign="center"
          sx={{ color: theme.palette.primary.main }}
        >
          {name}
        </Typography>
      </MenuItem>
    );
    return item;
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const getMenuItem = (settingsData) => {
    const { name, url } = settingsData;
    var item = (
      <MenuItem
        key={name}
        onClick={() => {
          logout().then(() => {
            dispatch(setToken(undefined));
            dispatch(util.invalidateTags(["User"]));
          });
          handleCloseUserMenu();
        }}
      >
        <Typography textAlign="center">{name}</Typography>
      </MenuItem>
    );
    if (url != undefined) {
      item = (
        <MenuItem
          key={name}
          onClick={handleCloseUserMenu}
          component={RouterLink}
          to={url}
        >
          <Typography textAlign="center">{name} </Typography>
        </MenuItem>
      );
    }
    return item;
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        border: "0px solid #ccc",
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.palette.background.default,
          boxShadow: "none",
          ".MuiOutlinedInput-notchedOutline": { border: 0 },
        }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", flexGrow: 1, marginLeft: "10px" }}>
            <MenuItem key={name} component={RouterLink} to="/">
              <Typography
                textAlign="center"
                sx={{ color: theme.palette.primary.main }}
              >
                {texts.menuTexts.home}
              </Typography>
            </MenuItem>

            {menusDisplayed.left.map(getPagesItem)}
          </Box>
          <Box
            sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}
          >
            {menusDisplayed.right.map(getPagesItem)}
          </Box>
          {menusDisplayed.settings.length > 0 && (
            <Box>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <SettingsOutlinedIcon />
                </IconButton>
              </Tooltip>

              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {menusDisplayed.settings.map(getMenuItem)}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
