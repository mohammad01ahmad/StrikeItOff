import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditProfileSheet from './EditProfileSheet';
import { updateProfile } from '../api/profile';

jest.mock('../api/profile', () => ({ updateProfile: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ Feather: 'Feather' }));

const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  firstName: 'Ahmad',
  lastName: 'Muhammad',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdateProfile.mockResolvedValue({ status: 'success', message: 'Updated', code: 200 });
});

describe('EditProfileSheet', () => {
  it('renders text inputs prefilled with the provided names', () => {
    render(<EditProfileSheet {...defaultProps} />);
    expect(screen.getByTestId('first-name-input').props.value).toBe('Ahmad');
    expect(screen.getByTestId('last-name-input').props.value).toBe('Muhammad');
  });

  it('does not render the sheet content when not visible', () => {
    render(<EditProfileSheet {...defaultProps} visible={false} />);
    expect(screen.queryByTestId('first-name-input')).toBeNull();
  });

  it('save button is disabled when first name is empty', () => {
    render(<EditProfileSheet {...defaultProps} />);
    fireEvent.changeText(screen.getByTestId('first-name-input'), '');
    expect(screen.getByTestId('save-button').props.accessibilityState?.disabled).toBe(true);
  });

  it('save button is disabled when last name is empty', () => {
    render(<EditProfileSheet {...defaultProps} />);
    fireEvent.changeText(screen.getByTestId('last-name-input'), '');
    expect(screen.getByTestId('save-button').props.accessibilityState?.disabled).toBe(true);
  });

  it('save button is disabled when first name is whitespace only', () => {
    render(<EditProfileSheet {...defaultProps} />);
    fireEvent.changeText(screen.getByTestId('first-name-input'), '   ');
    expect(screen.getByTestId('save-button').props.accessibilityState?.disabled).toBe(true);
  });

  it('calls updateProfile with trimmed names on save', async () => {
    render(<EditProfileSheet {...defaultProps} />);
    fireEvent.changeText(screen.getByTestId('first-name-input'), '  Ali  ');
    fireEvent.changeText(screen.getByTestId('last-name-input'), '  Khan  ');
    await act(async () => {
      fireEvent.press(screen.getByTestId('save-button'));
    });
    expect(mockUpdateProfile).toHaveBeenCalledWith('Ali', 'Khan');
  });

  it('calls onClose after a successful save', async () => {
    render(<EditProfileSheet {...defaultProps} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('save-button'));
    });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows an alert and keeps the sheet open when save fails', async () => {
    mockUpdateProfile.mockResolvedValue({ status: 'error', message: 'DB error', code: 400 });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<EditProfileSheet {...defaultProps} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('save-button'));
    });
    expect(alertSpy).toHaveBeenCalledWith('Update failed', 'DB error');
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('shows a coming-soon alert when Delete Account is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<EditProfileSheet {...defaultProps} />);
    fireEvent.press(screen.getByTestId('delete-button'));
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringMatching(/coming soon/i),
      expect.any(String)
    );
    alertSpy.mockRestore();
  });

  it('calls onClose when the backdrop is pressed', () => {
    render(<EditProfileSheet {...defaultProps} />);
    fireEvent.press(screen.getByTestId('backdrop'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('resets fields to new prop values when re-opened', () => {
    const { rerender } = render(
      <EditProfileSheet {...defaultProps} firstName="Old" lastName="Name" />
    );
    // Close then re-open with different props
    rerender(
      <EditProfileSheet {...defaultProps} visible={false} firstName="New" lastName="Person" />
    );
    rerender(
      <EditProfileSheet {...defaultProps} visible={true} firstName="New" lastName="Person" />
    );
    expect(screen.getByTestId('first-name-input').props.value).toBe('New');
    expect(screen.getByTestId('last-name-input').props.value).toBe('Person');
  });
});
