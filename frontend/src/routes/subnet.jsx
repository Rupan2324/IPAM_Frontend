import {useState, useEffect, useRef, useCallback} from "react";
import useAuth from "../hooks/useAuth";
import {Backdrop, Box, Button, Checkbox, Fade, IconButton, Modal, Paper, TextField, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import {ToastContainer, toast} from "react-toastify";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {Chip} from "@mui/joy";

const columns = [
    {
        id: "name",
        label: "Name",
        minWidth: 170,
        component: function (value) {
            return (
                <Typography paragraph m='0' fontWeight='700' fontSize='14px'>
                    {value}
                </Typography>
            );
        },
    },
    {
        id: "cidr",
        label: "CIDR",
        minWidth: 170,
        component: function (value) {
            return (
                <Typography paragraph m='0' fontWeight='700' fontSize='14px'>
                    {value}
                </Typography>
            );
        },
    },
    {
        id: "mask",
        label: "Mask",
        minWidth: 100,
        component: function (value) {
            return (
                <Typography paragraph m='0' fontWeight='700' fontSize='14px'>
                    {value}
                </Typography>
            );
        },
    },
    {
        id: "gateway",
        label: "Gateway",
        minWidth: 170,
        component: function (value) {
            return (
                <Typography paragraph m='0' fontWeight='700' fontSize='14px'>
                    {value}
                </Typography>
            );
        },
    },
    {
        id: "size",
        label: "Size",
        minWidth: 100,
        component: function (value) {
            return (
                <Typography paragraph m='0' fontWeight='700' fontSize='14px'>
                    {value}
                </Typography>
            );
        },
    },
    {
        id: "status",
        label: "Status",
        minWidth: 100,
        colorMap: {AVAILABLE: "success", IN_USE: "danger", RESERVED: "warning"},
        component: function (value) {
            return (
                <Chip key={value} color={this.colorMap[value]} size='sm'>
                    {value}
                </Chip>
            );
        },
    },
    {
        id: "expiration",
        label: "Expiration",
        minWidth: 200,
        component: function (value) {
            return (
                <Typography paragraph m='0' fontWeight='700' fontSize='12px'>
                    {value ? new Date(value).toLocaleString() : "-----"}
                </Typography>
            );
        },
    },
    {
        id: "updatedAt",
        label: "Updated At",
        minWidth: 200,
        component: function (value) {
            return (
                <Typography paragraph m='0' fontWeight='700' fontSize='12px'>
                    {value ? new Date(value).toLocaleString() : "-----"}
                </Typography>
            );
        },
    },
    {
        id: "user",
        label: "User",
        minWidth: 170,
        component: function (value) {
            return (
                <Typography paragraph m='0' fontWeight='700' fontSize='14px'>
                    {value ? value.name : "-----"}
                </Typography>
            );
        },
    },
    {id: "actions", label: "Actions", minWidth: 170},
];

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "white",
    boxShadow: 24,
    borderRadius: "8px",
    p: 4,
};

const toastConfig = {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    progress: undefined,
    theme: "light",
};

export default function SubnetsTable() {
    const [rows, setRows] = useState([]);
    const {authState, getRole} = useAuth();
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [form, setForm] = useState({
        name: "",
        cidr: "",
        mask: "",
        gateway: "",
    });
    const hasMounted = useRef(false);
    const {axiosPrivate} = useAxiosPrivate();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const request = async (id) => {
        await axiosPrivate.post(`/api/ipam/allocate/subnets/${id}/users/${authState?.id}`);
        toast(`🦄 subnet allocated`, toastConfig);
        fetchData();
    };

    const reserve = async (id) => {
        await axiosPrivate.post(`/api/ipam/reserve/network-object/${id}`, {purpose: "purpose"});
        toast(`🦄 subnet reserved`, toastConfig);
        fetchData();
    };

    const post = async (e) => {
        e.preventDefault();
        if (form.name === "" || form.cidr === "" || form.mask === "" || form.gateway === "") {
            return;
        }
        const URL = "/api/ipam/subnets";
        const res = await axiosPrivate.post(URL, {...form});
        toast(`🦄 new subnet added to pool`, toastConfig);
        if (res.status === 201) {
            fetchData();
            handleClose();
        }
    };

    const fetchData = useCallback(async () => {
        try {
            const URL = getRole() === "ROLE_ADMIN" ? "/api/ipam/subnets" : "/api/ipam/subnets/available";
            const response = await axiosPrivate.get(URL);
            setRows(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [axiosPrivate, getRole]);

    useEffect(() => {
        if (hasMounted.current) {
            fetchData();
        }

        return () => {
            hasMounted.current = true;
        };
    }, [fetchData]);

    return (
        <>
            <Paper
                sx={{
                    width: "100%",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    overflow: "hidden",
                    borderRadius: "0",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                }}>
                <h1>Subnets</h1>
                {getRole() === "ROLE_ADMIN" ? (
                    <IconButton onClick={handleOpen}>
                        <AddIcon />
                    </IconButton>
                ) : (
                    ""
                )}
            </Paper>
            <Paper
                sx={{
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "0",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    border: "1px solid #e6e6e6",
                }}>
                <TableContainer sx={{maxHeight: 440, overflow: "auto"}}>
                    <Table stickyHeader aria-label='sticky table'>
                        <TableHead>
                            <TableRow>
                                <TableCell padding='checkbox'>
                                    <Checkbox color='primary' checked={false} />
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell key={column.id} align={column.align} style={{minWidth: column.minWidth}}>
                                        <Typography paragraph fontWeight='700' fontSize='16px' m='0'>
                                            {column.label}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                return (
                                    <TableRow hover role='checkbox' tabIndex={-1} key={row.id}>
                                        <TableCell padding='checkbox'>
                                            <Checkbox color='primary' checked={false} />
                                        </TableCell>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            if (column.id === "actions") {
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {getRole() === "ROLE_ADMIN" ? (
                                                            <Button
                                                                variant='contained'
                                                                onClick={() => reserve(row.id)}
                                                                disabled={
                                                                    row.status === "RESERVED" || row.status === "IN_USE"
                                                                }>
                                                                Reserve
                                                            </Button>
                                                        ) : (
                                                            <Button variant='contained' onClick={() => request(row.id)}>
                                                                Request
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                );
                                            }
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.component ? column.component(value) : value}
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
                    component='div'
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
                            Add Subnet
                        </Typography>
                        <TextField
                            sx={{width: "100%", marginBottom: "1rem"}}
                            id='outlined-basic'
                            label='Name'
                            variant='outlined'
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                        />
                        <TextField
                            sx={{width: "100%", marginBottom: "1rem"}}
                            id='outlined-basic'
                            label='CIDR'
                            variant='outlined'
                            value={form.cidr}
                            onChange={(e) => setForm({...form, cidr: e.target.value})}
                        />
                        <TextField
                            sx={{width: "100%", marginBottom: "1rem"}}
                            id='outlined-basic'
                            label='Mask'
                            variant='outlined'
                            value={form.mask}
                            onChange={(e) => setForm({...form, mask: e.target.value})}
                        />
                        <TextField
                            sx={{width: "100%", marginBottom: "1rem"}}
                            id='outlined-basic'
                            label='Gateway'
                            variant='outlined'
                            value={form.gateway}
                            onChange={(e) => setForm({...form, gateway: e.target.value})}
                        />
                        <Button sx={{width: "100%"}} variant='contained' onClick={post}>
                            Add
                        </Button>
                    </Box>
                </Fade>
            </Modal>
            <ToastContainer />
        </>
    );
}