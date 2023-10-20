import {useState, useEffect} from "react";
import useAuth from "../hooks/useAuth";
import instance from "../api/axios";
import {Backdrop, Box, Button, Container, Fade, IconButton, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {ToastContainer, toast} from "react-toastify";

const columns = [
    {id: "id", label: "ID", minWidth: 100},
    {id: "address", label: "Address", minWidth: 170},
    {id: "status", label: "Status", minWidth: 100},
    {
        id: "expiration",
        label: "Expiration",
        minWidth: 170,
        format: (value) => (value ? new Date(value).toLocaleString() : "-----"),
    },
    {id: "updatedAt", label: "Updated At", minWidth: 170, format: (value) => new Date(value).toLocaleString()},
];

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "white",
    boxShadow: 24,
    p: 4,
};

export default function IPAddressesTable() {
    const [rows, setRows] = useState([]);
    const {authState, getRole} = useAuth();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };

    const handleClose = () => setOpen(false);
    const [ipAddress, setIpAddress] = useState("");

    const addIpAddress = async (e) => {
        e.preventDefault();
        if (ipAddress === "") {
            return;
        }
        const URL = "/api/ipam/ipaddresses";
        const res = await instance.post(
            URL,
            {address: ipAddress},
            {
                headers: {
                    Authorization: "Bearer " + authState?.token,
                },
            }
        );
        console.log(res);
        toast(`🦄 new ip address added to pool`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
        if (res.status === 201) {
            fetchData();
            handleClose();
        }
    };

    const fetchData = async () => {
        try {
            // Replace 'your_bearer_token_here' with the actual bearer token
            const URL = getRole() === "ROLE_ADMIN" ? "/api/ipam/ipaddresses" : "/api/ipam/ipaddresses/available";
            const response = await instance(URL, {
                headers: {
                    Authorization: "Bearer " + authState?.token,
                },
            });
            setRows(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData(); // Fetch data when the component mounts
    }, []);

    return (
        <Container sx={{display: "flex", flexDirection: "column"}}>
            <Paper
                sx={{
                    width: "100%",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    borderRadius: "0",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                }}>
                <h1>IP Addresses</h1>
                {getRole() === "ROLE_ADMIN" ? (
                    <IconButton onClick={handleOpen}>
                        <AddIcon />
                    </IconButton>
                ) : (
                    ""
                )}
            </Paper>
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius:"0", backgroundColor: "transparent", boxShadow:"none", border: "1px solid #e6e6e6" }}>
      <TableContainer sx={{ maxHeight: 440, overflow: 'auto' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
            <Modal
                aria-labelledby='transition-modal-title'
                aria-describedby='transition-modal-description'
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{backdrop: Backdrop}}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}>
                <Fade in={open}>
                    <Box sx={style}>
                        <Typography id='transition-modal-title' variant='h6' component='h2'>
                            Add Ip Address
                        </Typography>
                        <TextField
                            sx={{width: "100%", marginBottom: "1rem"}}
                            id='outlined-basic'
                            label='ip address'
                            variant='outlined'
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                        />

                        <Button sx={{width: "100%"}} variant='contained' onClick={addIpAddress}>
                            Add
                        </Button>
                    </Box>
                </Fade>
            </Modal>
            <ToastContainer />
        </Container>
    );
}
