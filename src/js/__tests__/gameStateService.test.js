import GameStateService from '../GameStateService';
import GamePlay from '../GamePlay';

jest.mock('../GamePlay');

describe('GameStateService', () => {
  let gameStateService;
  let mockStorage;

  beforeEach(() => {
    mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    gameStateService = new GameStateService(mockStorage);
    
    GamePlay.showError.mockClear();
  });

  describe('load()', () => {
    test('should successfully load valid state', () => {
      const testState = { level: 1, score: 100 };
      mockStorage.getItem.mockReturnValue(JSON.stringify(testState));
      
      const result = gameStateService.load();
      
      expect(mockStorage.getItem).toHaveBeenCalledWith('state');
      expect(result).toEqual(testState);
      expect(GamePlay.showError).not.toHaveBeenCalled();
    });

    test('should show error and throw for invalid JSON', () => {
      mockStorage.getItem.mockReturnValue('invalid json');
      
      expect(() => gameStateService.load()).toThrow();
      expect(GamePlay.showError).toHaveBeenCalledWith('Invalid state');
    });

    test('should return null without error when state is null', () => {
        mockStorage.getItem.mockReturnValue(null);
        
        const result = gameStateService.load();
        
        expect(result).toBeNull();
        expect(GamePlay.showError).not.toHaveBeenCalled();
    });

    test('should show error and throw for malformed JSON', () => {
      const malformedJson = '{"level": 1, "score": 100';
      mockStorage.getItem.mockReturnValue(malformedJson);
      
      expect(() => gameStateService.load()).toThrow();
      expect(GamePlay.showError).toHaveBeenCalledWith('Invalid state');
    });
  });

  describe('save()', () => {
    test('should save state', () => {
      const testState = { level: 1, score: 100 };
      
      gameStateService.save(testState);
      
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'state',
        JSON.stringify(testState)
      );
    });
  });
});