import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { MachinesService } from './machines.service';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { CreateMachineInput, UpdateMachineInput } from './machines.schema';

describe('MachinesService', () => {
  let service: MachinesService;
  let prismaService: PrismaService;
  let alertsService: AlertsService;

  const mockPrismaService = {
    machine: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    stock: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    slot: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAlertsService = {
    updateMachineAlerts: jest.fn(),
    createAlert: jest.fn(),
    resolveAlert: jest.fn(),
    getMachineAlerts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MachinesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AlertsService,
          useValue: mockAlertsService,
        },
      ],
    }).compile();

    service = module.get<MachinesService>(MachinesService);
    prismaService = module.get<PrismaService>(PrismaService);
    alertsService = module.get<AlertsService>(AlertsService);

    jest.clearAllMocks();
  });

  describe('createMachine', () => {
    const createMachineDto: CreateMachineInput = {
      location: 'Test Location',
      label: 'Test Machine Label',
      contact: 'test@example.com',
    };

    const mockMachineFromDb = {
      id: 'machine-1',
      location: 'Test Location',
      label: 'Test Machine Label',
      contact: 'test@example.com',
      status: 'ONLINE',
      last_update: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockMachine = {
      id: 'machine-1',
      location: 'Test Location',
      label: 'Test Machine Label',
      contact: 'test@example.com',
      status: 'online',
      last_update: mockMachineFromDb.last_update,
    };

    it('should create machine successfully', async () => {
      mockPrismaService.machine.create.mockResolvedValue(mockMachineFromDb);
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.createMachine(createMachineDto);

      expect(mockPrismaService.machine.create).toHaveBeenCalledWith({
        data: {
          location: createMachineDto.location,
          label: createMachineDto.label,
          status: 'OFFLINE',
          contact: createMachineDto.contact,
          last_update: expect.any(String),
        },
      });
      expect(mockAlertsService.updateMachineAlerts).toHaveBeenCalledWith(
        'machine-1',
      );
      expect(result).toEqual(mockMachine);
    });

    it('should handle creation errors', async () => {
      mockPrismaService.machine.create.mockRejectedValue(
        new Error('Creation failed'),
      );

      await expect(service.createMachine(createMachineDto)).rejects.toThrow(
        'Creation failed',
      );
    });

    it('should create machine with minimal data', async () => {
      const minimalDto = {
        location: 'Minimal Location',
        label: 'Minimal Label',
      };

      const minimalMachine = {
        id: 'machine-2',
        ...minimalDto,
        contact: null,
        status: 'ONLINE',
        last_update: new Date(),
      };

      mockPrismaService.machine.create.mockResolvedValue(minimalMachine);
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.createMachine(minimalDto);

      expect(result.contact).toBeNull();
    });
  });

  describe('getAllMachines', () => {
    const mockMachinesFromDb = [
      {
        id: 'machine-1',
        location: 'Location 1',
        label: 'Machine 1',
        status: 'ONLINE',
        last_update: new Date(),
      },
      {
        id: 'machine-2',
        location: 'Location 2',
        label: 'Machine 2',
        status: 'OFFLINE',
        last_update: new Date(),
      },
    ];

    const mockMachines = [
      {
        id: 'machine-1',
        location: 'Location 1',
        label: 'Machine 1',
        contact: null,
        status: 'online',
        last_update: mockMachinesFromDb[0].last_update,
      },
      {
        id: 'machine-2',
        location: 'Location 2',
        label: 'Machine 2',
        contact: null,
        status: 'offline',
        last_update: mockMachinesFromDb[1].last_update,
      },
    ];

    it('should return all machines', async () => {
      mockPrismaService.machine.findMany.mockResolvedValue(mockMachinesFromDb);

      const result = await service.getAllMachines();

      expect(mockPrismaService.machine.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockMachines);
    });

    it('should handle database errors', async () => {
      mockPrismaService.machine.findMany.mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.getAllMachines()).rejects.toThrow('DB Error');
    });
  });

  describe('getMachineById', () => {
    const mockMachineFromDb = {
      id: 'machine-1',
      location: 'Test Location',
      label: 'Test Machine',
      status: 'ONLINE',
      last_update: new Date(),
    };

    const mockMachine = {
      id: 'machine-1',
      location: 'Test Location',
      label: 'Test Machine',
      contact: null,
      status: 'online',
      last_update: mockMachineFromDb.last_update,
    };

    it('should return machine by id', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(mockMachineFromDb);

      const result = await service.getMachineById('machine-1');

      expect(mockPrismaService.machine.findUnique).toHaveBeenCalledWith({
        where: { id: 'machine-1' },
      });
      expect(result).toEqual(mockMachine);
    });

    it('should throw NotFoundException if machine not found', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(null);

      await expect(service.getMachineById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle database errors', async () => {
      mockPrismaService.machine.findUnique.mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.getMachineById('machine-1')).rejects.toThrow(
        'DB Error',
      );
    });
  });

  describe('updateMachine', () => {
    const updateMachineDto: UpdateMachineInput = {
      location: 'Updated Location',
      label: 'Updated Label',
      status: 'maintenance',
    };

    const updatedMachineFromDb = {
      id: 'machine-1',
      location: 'Updated Location',
      label: 'Updated Label',
      status: 'MAINTENANCE',
      last_update: new Date(),
    };

    const updatedMachine = {
      id: 'machine-1',
      location: 'Updated Location',
      label: 'Updated Label',
      contact: null,
      status: 'maintenance',
      last_update: updatedMachineFromDb.last_update,
    };

    it('should update machine successfully', async () => {
      mockPrismaService.machine.update.mockResolvedValue(updatedMachineFromDb);
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.updateMachine('machine-1', updateMachineDto);

      expect(mockPrismaService.machine.update).toHaveBeenCalledWith({
        where: { id: 'machine-1' },
        data: {
          location: updateMachineDto.location,
          label: updateMachineDto.label,
          status: 'MAINTENANCE',
          last_update: expect.any(String),
        },
      });
      // Le service updateMachine n'appelle pas updateMachineAlerts
      expect(result).toEqual(updatedMachine);
    });

    it('should handle update errors', async () => {
      mockPrismaService.machine.update.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(
        service.updateMachine('machine-1', updateMachineDto),
      ).rejects.toThrow('Machine not found');
    });
  });

  describe('deleteMachine', () => {
    it('should delete machine successfully', async () => {
      mockPrismaService.machine.delete.mockResolvedValue({
        id: 'machine-1',
      });

      const result = await service.deleteMachine('machine-1');

      expect(mockPrismaService.machine.delete).toHaveBeenCalledWith({
        where: { id: 'machine-1' },
      });
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      mockPrismaService.machine.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(service.deleteMachine('machine-1')).rejects.toThrow(
        'Machine not found',
      );
    });
  });

  describe('getMachinesByLocation', () => {
    const mockMachines = [
      {
        id: 'machine-1',
        location: 'Campus A',
        status: 'ONLINE',
        last_update: new Date(),
      },
      {
        id: 'machine-2',
        location: 'Campus A',
        status: 'OFFLINE',
        last_update: new Date(),
      },
    ];

    it('should return machines by location', async () => {
      mockPrismaService.machine.findMany.mockResolvedValue(mockMachines);

      const result = await service.getMachinesByLocation('Campus A');

      expect(mockPrismaService.machine.findMany).toHaveBeenCalledWith({
        where: { location: { contains: 'Campus A', mode: 'insensitive' } },
        orderBy: { label: 'asc' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array for location with no machines', async () => {
      mockPrismaService.machine.findMany.mockResolvedValue([]);

      const result = await service.getMachinesByLocation('Empty Location');

      expect(result).toEqual([]);
    });
  });

  describe('getOnlineMachines', () => {
    const mockOnlineMachines = [
      {
        id: 'machine-1',
        location: 'Location 1',
        status: 'ONLINE',
        last_update: new Date(),
      },
      {
        id: 'machine-2',
        location: 'Location 2',
        status: 'ONLINE',
        last_update: new Date(),
      },
    ];

    it('should return only online machines', async () => {
      mockPrismaService.machine.findMany.mockResolvedValue(mockOnlineMachines);

      const result = await service.getOnlineMachines();

      expect(mockPrismaService.machine.findMany).toHaveBeenCalledWith({
        where: { status: 'ONLINE' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getMachineStats', () => {
    it('should return machine statistics', async () => {
      const mockOrdersPaidAll = [
        { amount_total_cents: 1000 },
        { amount_total_cents: 1500 },
      ];

      const mockOrdersPaid30d = [{ amount_total_cents: 1000 }];

      const mockStockDetails = [
        { quantity: 5, low_threshold: 10, max_capacity: 20 },
        { quantity: 15, low_threshold: 5, max_capacity: 30 },
      ];

      mockPrismaService.stock.count
        .mockResolvedValueOnce(2) // totalSlots
        .mockResolvedValueOnce(1) // lowStockCount
        .mockResolvedValueOnce(0); // outOfStockCount

      mockPrismaService.order.findMany
        .mockResolvedValueOnce(mockOrdersPaidAll) // ordersPaidAll
        .mockResolvedValueOnce(mockOrdersPaid30d); // ordersPaid30d

      mockPrismaService.stock.findMany.mockResolvedValue(mockStockDetails);

      const result = await service.getMachineStats('machine-1');

      expect(result).toEqual({
        machine_id: 'machine-1',
        totalSlots: 2,
        lowStockCount: 1,
        outOfStockCount: 0,
        revenueTotalCents: 2500,
        revenueLast30dCents: 1000,
        ordersLast30d: 1,
        currentStockQuantity: 20,
        maxCapacityTotal: 50,
        stockPercentage: 40,
      });
    });

    it('should handle empty orders', async () => {
      mockPrismaService.stock.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockPrismaService.order.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockPrismaService.stock.findMany.mockResolvedValue([]);

      const result = await service.getMachineStats('machine-1');

      expect(result.revenueTotalCents).toBe(0);
    });

    it('should handle count errors', async () => {
      mockPrismaService.stock.count.mockRejectedValue(
        new Error('Count failed'),
      );

      await expect(service.getMachineStats('machine-1')).rejects.toThrow(
        'Count failed',
      );
    });
  });

  describe('updateMachineStatus', () => {
    it('should update machine status', async () => {
      const updatedMachine = {
        id: 'machine-1',
        status: 'MAINTENANCE',
        last_update: new Date(),
      };

      mockPrismaService.machine.update.mockResolvedValue(updatedMachine);
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.updateMachineStatus(
        'machine-1',
        'maintenance',
      );

      expect(mockPrismaService.machine.update).toHaveBeenCalledWith({
        where: { id: 'machine-1' },
        data: {
          status: 'MAINTENANCE',
          last_update: expect.any(String),
        },
      });
      expect(result.status).toBe('maintenance');
    });
  });
});
