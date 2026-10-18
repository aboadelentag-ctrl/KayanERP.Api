< Project >
  < PropertyGroup >
    < LangVersion > latest </ LangVersion >
    < Nullable > enable </ Nullable >
    < ImplicitUsings > enable </ ImplicitUsings >
  </ PropertyGroup >

  < ItemGroup Condition = "'$(MSBuildProjectName)' != 'KayanERP.Shared'" >
    < Using Include = "KayanERP.Shared.DTOs" />
  </ ItemGroup >
</ Project >