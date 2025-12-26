import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { CellState } from '../types';
import { useTheme } from '../contexts';

interface CellProps {
  cell: CellState;
  size: number;
  isSelected: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function Cell({
  cell,
  size,
  isSelected,
  isRelated,
  isSameNumber,
  onPress,
  style,
}: CellProps) {
  const { colors } = useTheme();

  // Determine background color based on state
  const getBackgroundColor = () => {
    if (isSelected) return colors.cellSelected;
    if (cell.isHighlighted) return colors.cellHighlighted;
    if (cell.isError) return colors.cellError;
    if (isSameNumber) return colors.cellSameNumber;
    if (isRelated) return colors.cellSameRegion;
    // No special background for given cells - they're distinguished by bold text
    return colors.cell;
  };

  // Determine text color
  const getTextColor = () => {
    if (cell.isError) return colors.textError;
    if (cell.isGiven) return colors.textGiven;
    return colors.textEntered;
  };

  const hasValue = cell.value !== 0;
  const hasCandidates = cell.candidates.size > 0;

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: getBackgroundColor(),
          borderColor: colors.gridLine,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {hasValue ? (
        <Text
          style={[
            styles.value,
            {
              fontSize: size * 0.6,
              color: getTextColor(),
              fontWeight: cell.isGiven ? '700' : '500',
            },
          ]}
        >
          {cell.value}
        </Text>
      ) : hasCandidates ? (
        <View style={styles.candidatesContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Text
              key={num}
              style={[
                styles.candidate,
                {
                  fontSize: size * 0.2,
                  opacity: cell.candidates.has(num) ? 1 : 0,
                  color: colors.textCandidate,
                },
              ]}
            >
              {num}
            </Text>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  value: {
    textAlign: 'center',
  },
  candidatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidate: {
    width: '33.33%',
    textAlign: 'center',
  },
});
