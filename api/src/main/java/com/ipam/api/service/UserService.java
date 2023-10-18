package com.ipam.api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ipam.api.dto.UserDTO;
import com.ipam.api.entity.User;
import com.ipam.api.repository.DNSRecordRepository;
import com.ipam.api.repository.IPAddressRepository;
import com.ipam.api.repository.IPRangeRepository;
import com.ipam.api.repository.SubnetRepository;
import com.ipam.api.repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IPRangeRepository ipRangeRepository;

    @Autowired
    private IPAddressRepository ipAddressRepository;

    @Autowired
    private SubnetRepository subnetRepository;

    @Autowired
    private DNSRecordRepository dnsRecordRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findByRole("USER").stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());  
        userDTO.setIpAddressesCount(ipAddressRepository.countByUser(user));
        userDTO.setIpRangesCount(ipRangeRepository.countByUser(user));
        userDTO.setSubnetsCount(subnetRepository.countByUser(user));
        userDTO.setDnsRecordsCount(dnsRecordRepository.countByUser(user));
        return userDTO;
    }
    
}
