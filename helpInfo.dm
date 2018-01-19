
			////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////
			//////       ////   ////   /////////////      ///  ///////  ////
			//////  ///   ///  / / //  ///////////  /////////  ///////  ////
			//////  ////  ///  // ///  ////    ///  /////////  ///////  ////
			//////  ////  ///  //////  ///////////  /////////  ///////  ////
			//////  ///   ///  //////  ///////////  /////////  ///////  ////
			//////       ////  //////  ////////////       ///      ///  ////
			////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////

				<> Help for dm-cli - dynamicmind client ionic builder <>

	- Init:             $ dm-cli init --env=[enviroment]

							enviroment: "variable de  entorno de proyecto"


	- Build app:        $ dm-cli [action] [platform] --env=[enviroment] [--quick=on]
							
							action: run | build | prepare | emulate

							platform: android | ios

							enviroment: "variable de  entorno de proyecto"

							--quick=ok (optional): saltea la creacion de resources,
								incremento de version de compilacion, tageo en repositorio en git y reescritura del config.xml

	- Signed app:       $ dm-cli signed [platform] --env=[enviroment]

							platform: android | ios

							enviroment: "variable de  entorno de proyecto"

	- Switch proyect:   $ dm-cli switch [platform] --env=[enviroment]  

							platform: all | android | ios

							enviroment: "variable de  entorno de proyecto"

	- Get status info:  $ dm-cli status [--full]

							--full (opcional): Ejecuta git status luego de imprimir info del proyecto en curso 
